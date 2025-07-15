from flask import Blueprint, request, jsonify
from models.supplier import Supplier
from models.user import db
from routes.auth import login_required, role_required

supplier_bp = Blueprint('supplier', __name__)

@supplier_bp.route('/', methods=['GET'])
@login_required
def get_suppliers():
    """Listar todos os fornecedores"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        status = request.args.get('status', '')
        
        query = Supplier.query
        
        # Filtros
        if search:
            query = query.filter(
                (Supplier.name.contains(search)) |
                (Supplier.cnpj.contains(search)) |
                (Supplier.email.contains(search))
            )
        
        if category:
            query = query.filter(Supplier.category == category)
        
        if status:
            query = query.filter(Supplier.status == status)
        
        # Ordenação
        query = query.order_by(Supplier.name)
        
        # Paginação
        suppliers = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'suppliers': [supplier.to_dict() for supplier in suppliers.items],
            'total': suppliers.total,
            'pages': suppliers.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@supplier_bp.route('/<int:supplier_id>', methods=['GET'])
@login_required
def get_supplier(supplier_id):
    """Obter dados de um fornecedor específico"""
    try:
        supplier = Supplier.query.get_or_404(supplier_id)
        return jsonify({'supplier': supplier.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@supplier_bp.route('/', methods=['POST'])
@role_required(['admin', 'category_buyer'])
def create_supplier():
    """Criar novo fornecedor"""
    try:
        data = request.get_json()
        
        # Validar campos obrigatórios
        required_fields = ['name', 'cnpj', 'email', 'category']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se CNPJ já existe
        if Supplier.query.filter_by(cnpj=data['cnpj']).first():
            return jsonify({'error': 'CNPJ já cadastrado'}), 400
        
        # Criar novo fornecedor
        supplier = Supplier(
            name=data['name'],
            cnpj=data['cnpj'],
            email=data['email'],
            phone=data.get('phone'),
            address=data.get('address'),
            category=data['category'],
            status=data.get('status', 'active')
        )
        
        db.session.add(supplier)
        db.session.commit()
        
        return jsonify({
            'message': 'Fornecedor criado com sucesso',
            'supplier': supplier.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@supplier_bp.route('/<int:supplier_id>', methods=['PUT'])
@role_required(['admin', 'category_buyer'])
def update_supplier(supplier_id):
    """Atualizar dados de um fornecedor"""
    try:
        supplier = Supplier.query.get_or_404(supplier_id)
        data = request.get_json()
        
        # Atualizar campos permitidos
        allowed_fields = ['name', 'email', 'phone', 'address', 'category', 'status']
        for field in allowed_fields:
            if field in data:
                setattr(supplier, field, data[field])
        
        # CNPJ só pode ser alterado se não houver conflito
        if 'cnpj' in data and data['cnpj'] != supplier.cnpj:
            existing = Supplier.query.filter_by(cnpj=data['cnpj']).first()
            if existing:
                return jsonify({'error': 'CNPJ já cadastrado'}), 400
            supplier.cnpj = data['cnpj']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Fornecedor atualizado com sucesso',
            'supplier': supplier.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@supplier_bp.route('/<int:supplier_id>', methods=['DELETE'])
@role_required(['admin'])
def delete_supplier(supplier_id):
    """Excluir um fornecedor"""
    try:
        supplier = Supplier.query.get_or_404(supplier_id)
        
        # Verificar se há tabelas de custo associadas
        if supplier.cost_tables:
            return jsonify({
                'error': 'Não é possível excluir fornecedor com tabelas de custo associadas'
            }), 400
        
        db.session.delete(supplier)
        db.session.commit()
        
        return jsonify({'message': 'Fornecedor excluído com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@supplier_bp.route('/categories', methods=['GET'])
@login_required
def get_categories():
    """Listar todas as categorias de fornecedores"""
    try:
        categories = db.session.query(Supplier.category).distinct().all()
        categories_list = [cat[0] for cat in categories if cat[0]]
        
        return jsonify({'categories': sorted(categories_list)}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@supplier_bp.route('/<int:supplier_id>/cost-tables', methods=['GET'])
@login_required
def get_supplier_cost_tables(supplier_id):
    """Listar tabelas de custo de um fornecedor"""
    try:
        supplier = Supplier.query.get_or_404(supplier_id)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', '')
        
        query = supplier.cost_tables
        
        if status:
            query = query.filter_by(status=status)
        
        query = query.order_by(CostTable.created_at.desc())
        
        cost_tables = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'cost_tables': [table.to_dict() for table in cost_tables.items],
            'total': cost_tables.total,
            'pages': cost_tables.pages,
            'current_page': page,
            'per_page': per_page,
            'supplier': supplier.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

