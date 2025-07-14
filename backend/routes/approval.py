from flask import Blueprint, request, jsonify, session
from src.models.approval import Approval, ApprovalTemplate
from src.models.cost_table import CostTable
from src.models.user import User, db
from src.routes.auth import login_required, role_required
from datetime import datetime

approval_bp = Blueprint('approval', __name__)

def create_approval_workflow(cost_table):
    """Cria o fluxo de aprovação para uma tabela de custos"""
    try:
        # Determinar nível de aprovação necessário
        approval_level = cost_table.calculate_approval_level_required()
        
        # Definir sequência de aprovação baseada no impacto
        approval_steps = []
        
        # Sempre começa com comprador da categoria
        approval_steps.append({
            'type': 'category_buyer',
            'sequence': 1
        })
        
        # Análise de pricing
        approval_steps.append({
            'type': 'pricing_analyst',
            'sequence': 2
        })
        
        # Baseado no valor, adicionar aprovadores
        if approval_level in ['manager', 'director', 'vp', 'full_chain']:
            approval_steps.append({
                'type': 'commercial_manager',
                'sequence': 3
            })
        
        if approval_level in ['director', 'vp', 'full_chain']:
            approval_steps.append({
                'type': 'commercial_director',
                'sequence': 4
            })
            approval_steps.append({
                'type': 'pricing_director',
                'sequence': 5
            })
        
        if approval_level in ['vp', 'full_chain']:
            approval_steps.append({
                'type': 'vp_commercial',
                'sequence': 6
            })
        
        # Criar registros de aprovação
        for step in approval_steps:
            # Encontrar usuário apropriado para o tipo de aprovação
            approver = User.query.filter_by(
                role=step['type'],
                is_active=True
            ).first()
            
            if approver:
                approval = Approval(
                    cost_table_id=cost_table.id,
                    approver_id=approver.id,
                    approval_type=step['type'],
                    sequence_order=step['sequence'],
                    status='pending' if step['sequence'] == 1 else 'waiting'
                )
                db.session.add(approval)
        
        # Atualizar status da tabela
        cost_table.status = 'under_review'
        db.session.commit()
        
        return True, None
        
    except Exception as e:
        db.session.rollback()
        return False, str(e)

@approval_bp.route('/pending', methods=['GET'])
@login_required
def get_pending_approvals():
    """Listar aprovações pendentes para o usuário logado"""
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Buscar aprovações pendentes
        query = Approval.query.filter(
            (Approval.approver_id == user_id) | (Approval.delegated_to == user_id),
            Approval.status == 'pending'
        ).order_by(Approval.deadline.asc())
        
        approvals = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Incluir dados da tabela de custo
        result = []
        for approval in approvals.items:
            approval_dict = approval.to_dict()
            approval_dict['cost_table'] = approval.cost_table.to_dict()
            approval_dict['cost_table']['supplier'] = approval.cost_table.supplier.to_dict()
            approval_dict['approver'] = approval.approver.to_dict()
            result.append(approval_dict)
        
        return jsonify({
            'approvals': result,
            'total': approvals.total,
            'pages': approvals.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/<int:approval_id>/approve', methods=['POST'])
@login_required
def approve_request(approval_id):
    """Aprovar uma solicitação"""
    try:
        approval = Approval.query.get_or_404(approval_id)
        user_id = session['user_id']
        
        # Verificar permissão
        if approval.approver_id != user_id and approval.delegated_to != user_id:
            return jsonify({'error': 'Acesso negado'}), 403
        
        if approval.status != 'pending':
            return jsonify({'error': 'Aprovação não está pendente'}), 400
        
        data = request.get_json()
        comments = data.get('comments', '')
        
        # Aprovar
        approval.approve(user_id, comments)
        
        # Verificar se é a última aprovação da sequência
        cost_table = approval.cost_table
        next_approval = Approval.query.filter_by(
            cost_table_id=cost_table.id,
            sequence_order=approval.sequence_order + 1
        ).first()
        
        if next_approval:
            # Ativar próxima aprovação
            next_approval.status = 'pending'
            
            # Atualizar status da tabela baseado no tipo de aprovação
            status_map = {
                'category_buyer': 'pricing_analysis',
                'pricing_analyst': 'commercial_review',
                'commercial_manager': 'director_review',
                'commercial_director': 'director_review',
                'pricing_director': 'vp_review',
                'vp_commercial': 'approved'
            }
            cost_table.status = status_map.get(approval.approval_type, 'under_review')
        else:
            # Última aprovação - aprovar tabela
            cost_table.status = 'approved'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Aprovação realizada com sucesso',
            'approval': approval.to_dict(),
            'cost_table_status': cost_table.status
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/<int:approval_id>/reject', methods=['POST'])
@login_required
def reject_request(approval_id):
    """Rejeitar uma solicitação"""
    try:
        approval = Approval.query.get_or_404(approval_id)
        user_id = session['user_id']
        
        # Verificar permissão
        if approval.approver_id != user_id and approval.delegated_to != user_id:
            return jsonify({'error': 'Acesso negado'}), 403
        
        if approval.status != 'pending':
            return jsonify({'error': 'Aprovação não está pendente'}), 400
        
        data = request.get_json()
        reason = data.get('reason', '')
        comments = data.get('comments', '')
        
        if not reason:
            return jsonify({'error': 'Motivo da rejeição é obrigatório'}), 400
        
        # Rejeitar
        approval.reject(user_id, reason, comments)
        
        # Rejeitar tabela de custo
        cost_table = approval.cost_table
        cost_table.status = 'rejected'
        cost_table.rejection_reason = reason
        
        # Cancelar todas as outras aprovações pendentes
        other_approvals = Approval.query.filter_by(
            cost_table_id=cost_table.id,
            status='pending'
        ).filter(Approval.id != approval_id).all()
        
        for other_approval in other_approvals:
            other_approval.status = 'cancelled'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Rejeição realizada com sucesso',
            'approval': approval.to_dict(),
            'cost_table_status': cost_table.status
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/<int:approval_id>/delegate', methods=['POST'])
@login_required
def delegate_approval(approval_id):
    """Delegar uma aprovação para outro usuário"""
    try:
        approval = Approval.query.get_or_404(approval_id)
        user_id = session['user_id']
        
        # Verificar permissão
        if approval.approver_id != user_id:
            return jsonify({'error': 'Acesso negado'}), 403
        
        if approval.status != 'pending':
            return jsonify({'error': 'Aprovação não está pendente'}), 400
        
        user = User.query.get(user_id)
        if not user.can_delegate:
            return jsonify({'error': 'Usuário não tem permissão para delegar'}), 403
        
        data = request.get_json()
        delegated_to_id = data.get('delegated_to_id')
        reason = data.get('reason', '')
        
        if not delegated_to_id:
            return jsonify({'error': 'ID do usuário para delegação é obrigatório'}), 400
        
        # Verificar se usuário de destino existe e está ativo
        delegated_user = User.query.get(delegated_to_id)
        if not delegated_user or not delegated_user.is_active:
            return jsonify({'error': 'Usuário de destino inválido'}), 400
        
        # Delegar
        approval.delegate(delegated_to_id, reason, user_id)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Delegação realizada com sucesso',
            'approval': approval.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/cost-table/<int:table_id>/start-workflow', methods=['POST'])
@role_required(['admin', 'category_buyer'])
def start_approval_workflow(table_id):
    """Iniciar fluxo de aprovação para uma tabela de custos"""
    try:
        cost_table = CostTable.query.get_or_404(table_id)
        
        if cost_table.status != 'submitted':
            return jsonify({'error': 'Tabela não está no status adequado para iniciar aprovação'}), 400
        
        # Verificar se já existe fluxo de aprovação
        existing_approvals = Approval.query.filter_by(cost_table_id=table_id).first()
        if existing_approvals:
            return jsonify({'error': 'Fluxo de aprovação já existe para esta tabela'}), 400
        
        # Criar fluxo de aprovação
        success, error = create_approval_workflow(cost_table)
        if not success:
            return jsonify({'error': f'Erro ao criar fluxo de aprovação: {error}'}), 500
        
        return jsonify({
            'message': 'Fluxo de aprovação iniciado com sucesso',
            'cost_table': cost_table.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/cost-table/<int:table_id>/workflow', methods=['GET'])
@login_required
def get_approval_workflow(table_id):
    """Obter fluxo de aprovação de uma tabela de custos"""
    try:
        cost_table = CostTable.query.get_or_404(table_id)
        
        approvals = Approval.query.filter_by(
            cost_table_id=table_id
        ).order_by(Approval.sequence_order).all()
        
        workflow = []
        for approval in approvals:
            approval_dict = approval.to_dict()
            approval_dict['approver'] = approval.approver.to_dict()
            if approval.delegated_user:
                approval_dict['delegated_user'] = approval.delegated_user.to_dict()
            workflow.append(approval_dict)
        
        return jsonify({
            'workflow': workflow,
            'cost_table': cost_table.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/overdue', methods=['GET'])
@role_required(['admin', 'commercial_manager', 'commercial_director', 'vp_commercial'])
def get_overdue_approvals():
    """Listar aprovações em atraso"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Buscar aprovações em atraso
        query = Approval.query.filter(
            Approval.status == 'pending',
            Approval.deadline < datetime.utcnow()
        ).order_by(Approval.deadline.asc())
        
        approvals = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Incluir dados completos
        result = []
        for approval in approvals.items:
            approval_dict = approval.to_dict()
            approval_dict['cost_table'] = approval.cost_table.to_dict()
            approval_dict['cost_table']['supplier'] = approval.cost_table.supplier.to_dict()
            approval_dict['approver'] = approval.approver.to_dict()
            result.append(approval_dict)
        
        return jsonify({
            'overdue_approvals': result,
            'total': approvals.total,
            'pages': approvals.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/reminders', methods=['GET'])
@role_required(['admin'])
def get_reminder_candidates():
    """Listar aprovações que precisam de lembrete"""
    try:
        # Buscar aprovações que precisam de lembrete
        approvals = Approval.query.filter(
            Approval.status == 'pending'
        ).all()
        
        reminder_candidates = []
        for approval in approvals:
            if approval.needs_reminder:
                approval_dict = approval.to_dict()
                approval_dict['cost_table'] = approval.cost_table.to_dict()
                approval_dict['cost_table']['supplier'] = approval.cost_table.supplier.to_dict()
                approval_dict['approver'] = approval.approver.to_dict()
                reminder_candidates.append(approval_dict)
        
        return jsonify({
            'reminder_candidates': reminder_candidates,
            'total': len(reminder_candidates)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

