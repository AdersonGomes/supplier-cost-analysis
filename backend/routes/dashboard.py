from flask import Blueprint, request, jsonify, session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from models.cost_table import CostTable
from models.approval import Approval
from models.supplier import Supplier
from models.user import User, db
from routes.auth import login_required

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/overview', methods=['GET'])
@login_required
def get_dashboard_overview():
    """Obter visão geral do dashboard"""
    try:
        user = User.query.get(session['user_id'])
        
        # Métricas básicas
        total_suppliers = Supplier.query.filter_by(status='active').count()
        total_cost_tables = CostTable.query.count()
        
        # Tabelas por status
        status_counts = db.session.query(
            CostTable.status,
            func.count(CostTable.id)
        ).group_by(CostTable.status).all()
        
        status_summary = {status: count for status, count in status_counts}
        
        # Aprovações pendentes para o usuário
        pending_approvals = 0
        if user.role != 'supplier':
            pending_approvals = Approval.query.filter(
                or_(Approval.approver_id == user.id, Approval.delegated_to == user.id),
                Approval.status == 'pending'
            ).count()
        
        # Aprovações em atraso (apenas para gestores)
        overdue_approvals = 0
        if user.role in ['admin', 'commercial_manager', 'commercial_director', 'vp_commercial']:
            overdue_approvals = Approval.query.filter(
                Approval.status == 'pending',
                Approval.deadline < datetime.utcnow()
            ).count()
        
        # Impacto financeiro do mês
        current_month = datetime.now().replace(day=1)
        monthly_impact = db.session.query(
            func.sum(CostTable.monthly_impact)
        ).filter(
            CostTable.created_at >= current_month,
            CostTable.status.in_(['approved', 'under_review', 'pricing_analysis', 'commercial_review'])
        ).scalar() or 0
        
        # Tabelas aprovadas no mês
        approved_this_month = CostTable.query.filter(
            CostTable.status == 'approved',
            CostTable.updated_at >= current_month
        ).count()
        
        return jsonify({
            'overview': {
                'total_suppliers': total_suppliers,
                'total_cost_tables': total_cost_tables,
                'pending_approvals': pending_approvals,
                'overdue_approvals': overdue_approvals,
                'monthly_impact': float(monthly_impact),
                'approved_this_month': approved_this_month,
                'status_summary': status_summary
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/recent-activity', methods=['GET'])
@login_required
def get_recent_activity():
    """Obter atividades recentes"""
    try:
        user = User.query.get(session['user_id'])
        limit = request.args.get('limit', 10, type=int)
        
        activities = []
        
        # Tabelas de custo recentes
        recent_tables_query = CostTable.query.order_by(CostTable.created_at.desc()).limit(limit)
        
        # Filtrar por fornecedor se for usuário fornecedor
        if user.role == 'supplier':
            supplier = Supplier.query.filter_by(email=user.email).first()
            if supplier:
                recent_tables_query = recent_tables_query.filter_by(supplier_id=supplier.id)
        
        recent_tables = recent_tables_query.all()
        
        for table in recent_tables:
            activities.append({
                'type': 'cost_table_submitted',
                'timestamp': table.created_at.isoformat(),
                'description': f'Tabela de custos {table.filename} enviada por {table.supplier.name}',
                'data': {
                    'table_id': table.id,
                    'supplier_name': table.supplier.name,
                    'status': table.status,
                    'impact_value': float(table.monthly_impact or 0)
                }
            })
        
        # Aprovações recentes (apenas para usuários com permissão)
        if user.role != 'supplier':
            recent_approvals = Approval.query.filter(
                Approval.decision_date.isnot(None)
            ).order_by(Approval.decision_date.desc()).limit(limit).all()
            
            for approval in recent_approvals:
                action = 'aprovada' if approval.status == 'approved' else 'rejeitada'
                activities.append({
                    'type': f'approval_{approval.status}',
                    'timestamp': approval.decision_date.isoformat(),
                    'description': f'Tabela {approval.cost_table.filename} {action} por {approval.approver.full_name}',
                    'data': {
                        'table_id': approval.cost_table_id,
                        'approver_name': approval.approver.full_name,
                        'approval_type': approval.approval_type,
                        'status': approval.status
                    }
                })
        
        # Ordenar por timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            'recent_activity': activities[:limit]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/metrics/monthly', methods=['GET'])
@login_required
def get_monthly_metrics():
    """Obter métricas mensais"""
    try:
        months = request.args.get('months', 6, type=int)
        
        # Calcular período
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30 * months)
        
        # Métricas por mês
        monthly_data = []
        
        for i in range(months):
            month_start = end_date - timedelta(days=30 * (i + 1))
            month_end = end_date - timedelta(days=30 * i)
            
            # Tabelas submetidas no mês
            submitted = CostTable.query.filter(
                CostTable.created_at >= month_start,
                CostTable.created_at < month_end
            ).count()
            
            # Tabelas aprovadas no mês
            approved = CostTable.query.filter(
                CostTable.status == 'approved',
                CostTable.updated_at >= month_start,
                CostTable.updated_at < month_end
            ).count()
            
            # Impacto financeiro aprovado no mês
            impact = db.session.query(
                func.sum(CostTable.monthly_impact)
            ).filter(
                CostTable.status == 'approved',
                CostTable.updated_at >= month_start,
                CostTable.updated_at < month_end
            ).scalar() or 0
            
            monthly_data.append({
                'month': month_start.strftime('%Y-%m'),
                'submitted': submitted,
                'approved': approved,
                'impact': float(impact),
                'approval_rate': (approved / submitted * 100) if submitted > 0 else 0
            })
        
        monthly_data.reverse()  # Ordem cronológica
        
        return jsonify({
            'monthly_metrics': monthly_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/metrics/suppliers', methods=['GET'])
@login_required
def get_supplier_metrics():
    """Obter métricas por fornecedor"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        # Top fornecedores por impacto financeiro
        top_suppliers = db.session.query(
            Supplier.id,
            Supplier.name,
            func.sum(CostTable.monthly_impact).label('total_impact'),
            func.count(CostTable.id).label('total_tables'),
            func.sum(
                func.case([(CostTable.status == 'approved', 1)], else_=0)
            ).label('approved_tables')
        ).join(CostTable).group_by(
            Supplier.id, Supplier.name
        ).order_by(
            func.sum(CostTable.monthly_impact).desc()
        ).limit(limit).all()
        
        supplier_metrics = []
        for supplier in top_suppliers:
            approval_rate = (supplier.approved_tables / supplier.total_tables * 100) if supplier.total_tables > 0 else 0
            
            supplier_metrics.append({
                'supplier_id': supplier.id,
                'supplier_name': supplier.name,
                'total_impact': float(supplier.total_impact or 0),
                'total_tables': supplier.total_tables,
                'approved_tables': supplier.approved_tables,
                'approval_rate': approval_rate
            })
        
        return jsonify({
            'supplier_metrics': supplier_metrics
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/metrics/categories', methods=['GET'])
@login_required
def get_category_metrics():
    """Obter métricas por categoria"""
    try:
        # Métricas por categoria
        category_data = db.session.query(
            CostTable.category,
            func.count(CostTable.id).label('total_tables'),
            func.sum(CostTable.monthly_impact).label('total_impact'),
            func.avg(CostTable.monthly_impact).label('avg_impact'),
            func.sum(
                func.case([(CostTable.status == 'approved', 1)], else_=0)
            ).label('approved_tables')
        ).group_by(CostTable.category).all()
        
        category_metrics = []
        for category in category_data:
            approval_rate = (category.approved_tables / category.total_tables * 100) if category.total_tables > 0 else 0
            
            category_metrics.append({
                'category': category.category,
                'total_tables': category.total_tables,
                'total_impact': float(category.total_impact or 0),
                'avg_impact': float(category.avg_impact or 0),
                'approved_tables': category.approved_tables,
                'approval_rate': approval_rate
            })
        
        # Ordenar por impacto total
        category_metrics.sort(key=lambda x: x['total_impact'], reverse=True)
        
        return jsonify({
            'category_metrics': category_metrics
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/metrics/approval-times', methods=['GET'])
@login_required
def get_approval_time_metrics():
    """Obter métricas de tempo de aprovação"""
    try:
        # Aprovações concluídas nos últimos 3 meses
        three_months_ago = datetime.now() - timedelta(days=90)
        
        completed_approvals = Approval.query.filter(
            Approval.decision_date.isnot(None),
            Approval.decision_date >= three_months_ago
        ).all()
        
        approval_times = []
        for approval in completed_approvals:
            if approval.assigned_at and approval.decision_date:
                time_diff = approval.decision_date - approval.assigned_at
                approval_times.append({
                    'approval_type': approval.approval_type,
                    'days_taken': time_diff.days,
                    'status': approval.status,
                    'supplier_name': approval.cost_table.supplier.name
                })
        
        # Calcular médias por tipo de aprovação
        type_averages = {}
        for approval in approval_times:
            approval_type = approval['approval_type']
            if approval_type not in type_averages:
                type_averages[approval_type] = []
            type_averages[approval_type].append(approval['days_taken'])
        
        avg_times = {}
        for approval_type, times in type_averages.items():
            avg_times[approval_type] = sum(times) / len(times) if times else 0
        
        return jsonify({
            'approval_time_metrics': {
                'individual_approvals': approval_times,
                'average_times_by_type': avg_times,
                'total_completed': len(approval_times)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

