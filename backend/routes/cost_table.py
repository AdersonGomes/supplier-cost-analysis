from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.utils import secure_filename
import os
import hashlib
import pandas as pd
from datetime import datetime
from models.cost_table import CostTable, CostItem
from models.supplier import Supplier
from models.user import User, db
from routes.auth import login_required, role_required

cost_table_bp = Blueprint('cost_table', __name__)

ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_file_hash(file_path):
    """Calcula hash SHA256 do arquivo"""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def parse_cost_table_file(file_path, filename):
    """Processa arquivo de tabela de custos"""
    try:
        # Determinar tipo de arquivo e ler
        if filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
        
        # Validar colunas obrigatórias
        required_columns = ['sku', 'description', 'new_cost']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return None, f"Colunas obrigatórias ausentes: {', '.join(missing_columns)}"
        
        # Limpar e validar dados
        df = df.dropna(subset=['sku', 'new_cost'])
        df['sku'] = df['sku'].astype(str)
        df['description'] = df['description'].fillna('')
        df['category'] = df.get('category', '').fillna('')
        df['unit'] = df.get('unit', 'UN').fillna('UN')
        df['previous_cost'] = pd.to_numeric(df.get('previous_cost', 0), errors='coerce').fillna(0)
        df['new_cost'] = pd.to_numeric(df['new_cost'], errors='coerce')
        df['monthly_volume'] = pd.to_numeric(df.get('monthly_volume', 0), errors='coerce').fillna(0)
        
        # Remover linhas com new_cost inválido
        df = df.dropna(subset=['new_cost'])
        
        if len(df) == 0:
            return None, "Nenhum item válido encontrado no arquivo"
        
        return df, None
        
    except Exception as e:
        return None, f"Erro ao processar arquivo: {str(e)}"

@cost_table_bp.route('/', methods=['GET'])
@login_required
def get_cost_tables():
    """Listar tabelas de custo"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '')
        supplier_id = request.args.get('supplier_id', type=int)
        category = request.args.get('category', '')
        
        query = CostTable.query
        
        # Filtros baseados no role do usuário
        user = User.query.get(session['user_id'])
        if user.role == 'supplier':
            # Fornecedores só veem suas próprias tabelas
            supplier = Supplier.query.filter_by(email=user.email).first()
            if supplier:
                query = query.filter(CostTable.supplier_id == supplier.id)
            else:
                return jsonify({'cost_tables': [], 'total': 0}), 200
        
        # Aplicar filtros
        if status:
            query = query.filter(CostTable.status == status)
        
        if supplier_id:
            query = query.filter(CostTable.supplier_id == supplier_id)
        
        if category:
            query = query.filter(CostTable.category == category)
        
        # Ordenação
        query = query.order_by(CostTable.created_at.desc())
        
        # Paginação
        cost_tables = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Incluir dados do fornecedor
        result = []
        for table in cost_tables.items:
            table_dict = table.to_dict()
            table_dict['supplier'] = table.supplier.to_dict()
            table_dict['submitter'] = table.submitter.to_dict()
            result.append(table_dict)
        
        return jsonify({
            'cost_tables': result,
            'total': cost_tables.total,
            'pages': cost_tables.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cost_table_bp.route('/<int:table_id>', methods=['GET'])
@login_required
def get_cost_table(table_id):
    """Obter dados de uma tabela de custo específica"""
    try:
        cost_table = CostTable.query.get_or_404(table_id)
        
        # Verificar permissão
        user = User.query.get(session['user_id'])
        if user.role == 'supplier':
            supplier = Supplier.query.filter_by(email=user.email).first()
            if not supplier or cost_table.supplier_id != supplier.id:
                return jsonify({'error': 'Acesso negado'}), 403
        
        # Incluir itens da tabela
        table_dict = cost_table.to_dict()
        table_dict['supplier'] = cost_table.supplier.to_dict()
        table_dict['submitter'] = cost_table.submitter.to_dict()
        table_dict['items'] = [item.to_dict() for item in cost_table.cost_items]
        table_dict['approvals'] = [approval.to_dict() for approval in cost_table.approvals]
        
        return jsonify({'cost_table': table_dict}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cost_table_bp.route('/upload', methods=['POST'])
@login_required
def upload_cost_table():
    """Upload de nova tabela de custos"""
    try:
        # Verificar se arquivo foi enviado
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de arquivo não permitido'}), 400
        
        # Obter dados do formulário
        supplier_id = request.form.get('supplier_id', type=int)
        category = request.form.get('category')
        effective_date = request.form.get('effective_date')
        comments = request.form.get('comments', '')
        
        if not supplier_id or not category or not effective_date:
            return jsonify({'error': 'Campos obrigatórios: supplier_id, category, effective_date'}), 400
        
        # Verificar se fornecedor existe
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return jsonify({'error': 'Fornecedor não encontrado'}), 404
        
        # Verificar permissão
        user = User.query.get(session['user_id'])
        if user.role == 'supplier':
            supplier_user = Supplier.query.filter_by(email=user.email).first()
            if not supplier_user or supplier_user.id != supplier_id:
                return jsonify({'error': 'Acesso negado'}), 403
        
        # Salvar arquivo
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Calcular hash do arquivo
        file_hash = calculate_file_hash(file_path)
        file_size = os.path.getsize(file_path)
        
        # Processar arquivo
        df, error = parse_cost_table_file(file_path, filename)
        if error:
            os.remove(file_path)  # Remover arquivo inválido
            return jsonify({'error': error}), 400
        
        # Gerar versão
        last_version = CostTable.query.filter_by(supplier_id=supplier_id).order_by(CostTable.created_at.desc()).first()
        if last_version:
            version_num = float(last_version.version.replace('v', '')) + 0.1
            version = f"v{version_num:.1f}"
        else:
            version = "v1.0"
        
        # Criar registro da tabela
        cost_table = CostTable(
            supplier_id=supplier_id,
            version=version,
            filename=filename,
            file_path=file_path,
            file_size=file_size,
            file_hash=file_hash,
            effective_date=datetime.strptime(effective_date, '%Y-%m-%d').date(),
            category=category,
            status='submitted',
            total_items=len(df),
            submitted_by=session['user_id'],
            comments=comments
        )
        
        db.session.add(cost_table)
        db.session.flush()  # Para obter o ID
        
        # Processar itens
        total_value = 0
        total_impact = 0
        
        for _, row in df.iterrows():
            cost_item = CostItem(
                cost_table_id=cost_table.id,
                sku=row['sku'],
                description=row['description'],
                category=row['category'],
                unit=row['unit'],
                previous_cost=row['previous_cost'],
                new_cost=row['new_cost'],
                monthly_volume=row['monthly_volume']
            )
            
            # Calcular mudanças
            cost_item.calculate_changes()
            
            total_value += float(cost_item.new_cost) * float(cost_item.monthly_volume or 0)
            total_impact += float(cost_item.monthly_impact or 0)
            
            db.session.add(cost_item)
        
        # Atualizar totais da tabela
        cost_table.total_value = total_value
        cost_table.monthly_impact = total_impact
        
        # Calcular impacto baseado na tabela anterior
        previous_table = CostTable.query.filter_by(
            supplier_id=supplier_id,
            status='approved'
        ).order_by(CostTable.created_at.desc()).first()
        
        if previous_table:
            cost_table.previous_total_value = previous_table.total_value
            cost_table.impact_value = cost_table.total_value - previous_table.total_value
            if previous_table.total_value > 0:
                cost_table.impact_percentage = (cost_table.impact_value / previous_table.total_value) * 100
        
        db.session.commit()
        
        return jsonify({
            'message': 'Tabela de custos enviada com sucesso',
            'cost_table': cost_table.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'error': str(e)}), 500

@cost_table_bp.route('/<int:table_id>/items', methods=['GET'])
@login_required
def get_cost_table_items(table_id):
    """Listar itens de uma tabela de custo"""
    try:
        cost_table = CostTable.query.get_or_404(table_id)
        
        # Verificar permissão
        user = User.query.get(session['user_id'])
        if user.role == 'supplier':
            supplier = Supplier.query.filter_by(email=user.email).first()
            if not supplier or cost_table.supplier_id != supplier.id:
                return jsonify({'error': 'Acesso negado'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '')
        
        query = CostItem.query.filter_by(cost_table_id=table_id)
        
        if search:
            query = query.filter(
                (CostItem.sku.contains(search)) |
                (CostItem.description.contains(search))
            )
        
        query = query.order_by(CostItem.sku)
        
        items = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'items': [item.to_dict() for item in items.items],
            'total': items.total,
            'pages': items.pages,
            'current_page': page,
            'per_page': per_page,
            'cost_table': cost_table.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cost_table_bp.route('/<int:table_id>/status', methods=['PUT'])
@role_required(['admin', 'category_buyer', 'pricing_analyst', 'commercial_manager', 
               'commercial_director', 'pricing_director', 'vp_commercial'])
def update_status(table_id):
    """Atualizar status de uma tabela de custo"""
    try:
        cost_table = CostTable.query.get_or_404(table_id)
        data = request.get_json()
        
        new_status = data.get('status')
        comments = data.get('comments', '')
        
        valid_statuses = ['submitted', 'under_review', 'pricing_analysis', 'commercial_review',
                         'director_review', 'vp_review', 'approved', 'rejected', 'expired']
        
        if new_status not in valid_statuses:
            return jsonify({'error': 'Status inválido'}), 400
        
        cost_table.status = new_status
        if comments:
            cost_table.comments = comments
        
        db.session.commit()
        
        return jsonify({
            'message': 'Status atualizado com sucesso',
            'cost_table': cost_table.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

