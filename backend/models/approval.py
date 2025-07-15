from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from .user import db

class Approval(db.Model):
    __tablename__ = 'approvals'
    
    id = db.Column(db.Integer, primary_key=True)
    cost_table_id = db.Column(db.Integer, db.ForeignKey('cost_tables.id'), nullable=False)
    approver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Tipo de aprovação baseado na hierarquia
    approval_type = db.Column(db.String(30), nullable=False)
    # category_buyer, pricing_analyst, commercial_manager, 
    # commercial_director, pricing_director, vp_commercial
    
    # Status da aprovação
    status = db.Column(db.String(20), default='pending')
    # pending, approved, rejected, delegated, expired
    
    # Ordem na sequência de aprovação
    sequence_order = db.Column(db.Integer, nullable=False)
    
    # Dados da decisão
    decision_date = db.Column(db.DateTime)
    comments = db.Column(db.Text)
    rejection_reason = db.Column(db.Text)
    
    # Controle de prazos
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    deadline = db.Column(db.DateTime, nullable=False)
    reminded_at = db.Column(db.DateTime)  # Última vez que foi enviado lembrete
    
    # Delegação
    delegated_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    delegated_at = db.Column(db.DateTime)
    delegation_reason = db.Column(db.Text)
    
    # Metadados
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    approver = db.relationship('User', foreign_keys=[approver_id], backref='approvals_as_approver')
    delegated_user = db.relationship('User', foreign_keys=[delegated_to], backref='approvals_as_delegate')
    
    def __init__(self, **kwargs):
        super(Approval, self).__init__(**kwargs)
        if not self.deadline:
            # Define prazo baseado no tipo de aprovação
            days_map = {
                'category_buyer': 2,
                'pricing_analyst': 5,
                'commercial_manager': 3,
                'commercial_director': 5,
                'pricing_director': 5,
                'vp_commercial': 7
            }
            days = days_map.get(self.approval_type, 3)
            self.deadline = datetime.utcnow() + timedelta(days=days)
    
    @property
    def days_remaining(self):
        if self.deadline:
            delta = self.deadline - datetime.utcnow()
            return max(0, delta.days)
        return 0
    
    @property
    def is_overdue(self):
        return datetime.utcnow() > self.deadline if self.deadline else False
    
    @property
    def needs_reminder(self):
        """Verifica se precisa enviar lembrete (24h antes do vencimento)"""
        if self.status != 'pending':
            return False
        
        reminder_time = self.deadline - timedelta(hours=24)
        now = datetime.utcnow()
        
        # Se passou do tempo de lembrete e ainda não foi enviado
        if now >= reminder_time:
            if not self.reminded_at or self.reminded_at < reminder_time:
                return True
        
        return False
    
    def approve(self, approver_id, comments=None):
        """Aprova a solicitação"""
        self.status = 'approved'
        self.decision_date = datetime.utcnow()
        self.approver_id = approver_id
        self.comments = comments
    
    def reject(self, approver_id, reason, comments=None):
        """Rejeita a solicitação"""
        self.status = 'rejected'
        self.decision_date = datetime.utcnow()
        self.approver_id = approver_id
        self.rejection_reason = reason
        self.comments = comments
    
    def delegate(self, delegated_to_id, reason, delegated_by_id):
        """Delega a aprovação para outro usuário"""
        self.delegated_to = delegated_to_id
        self.delegated_at = datetime.utcnow()
        self.delegation_reason = reason
        self.status = 'delegated'
        # Mantém o approver_id original mas atualiza quem delegou
        
    def mark_reminded(self):
        """Marca que o lembrete foi enviado"""
        self.reminded_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'cost_table_id': self.cost_table_id,
            'approver_id': self.approver_id,
            'approval_type': self.approval_type,
            'status': self.status,
            'sequence_order': self.sequence_order,
            'decision_date': self.decision_date.isoformat() if self.decision_date else None,
            'comments': self.comments,
            'rejection_reason': self.rejection_reason,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'days_remaining': self.days_remaining,
            'is_overdue': self.is_overdue,
            'needs_reminder': self.needs_reminder,
            'delegated_to': self.delegated_to,
            'delegated_at': self.delegated_at.isoformat() if self.delegated_at else None,
            'delegation_reason': self.delegation_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Approval {self.approval_type} - {self.status}>'


class ApprovalTemplate(db.Model):
    """Template para definir fluxos de aprovação baseados em critérios"""
    __tablename__ = 'approval_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    
    # Critérios para aplicação do template
    min_impact_value = db.Column(db.Numeric(15, 2), default=0)
    max_impact_value = db.Column(db.Numeric(15, 2))
    categories = db.Column(db.Text)  # JSON array de categorias aplicáveis
    
    # Configuração do fluxo
    approval_steps = db.Column(db.Text, nullable=False)  # JSON array dos passos
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Metadados
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_approval_steps(self):
        """Retorna os passos de aprovação como lista"""
        import json
        return json.loads(self.approval_steps) if self.approval_steps else []
    
    def set_approval_steps(self, steps):
        """Define os passos de aprovação"""
        import json
        self.approval_steps = json.dumps(steps)
    
    def get_categories(self):
        """Retorna as categorias aplicáveis como lista"""
        import json
        return json.loads(self.categories) if self.categories else []
    
    def set_categories(self, categories):
        """Define as categorias aplicáveis"""
        import json
        self.categories = json.dumps(categories)
    
    def applies_to(self, cost_table):
        """Verifica se este template se aplica à tabela de custos"""
        # Verifica valor de impacto
        impact = float(cost_table.monthly_impact or 0)
        if impact < float(self.min_impact_value or 0):
            return False
        if self.max_impact_value and impact > float(self.max_impact_value):
            return False
        
        # Verifica categoria
        categories = self.get_categories()
        if categories and cost_table.category not in categories:
            return False
        
        return True
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'min_impact_value': float(self.min_impact_value) if self.min_impact_value else 0,
            'max_impact_value': float(self.max_impact_value) if self.max_impact_value else None,
            'categories': self.get_categories(),
            'approval_steps': self.get_approval_steps(),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<ApprovalTemplate {self.name}>'

