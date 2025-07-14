from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from src.models.user import db
import json

class CostTable(db.Model):
    __tablename__ = 'cost_tables'
    
    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    version = db.Column(db.String(20), nullable=False)  # v1.0, v1.1, etc.
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    file_hash = db.Column(db.String(64))  # SHA256 hash for integrity
    
    # Metadados da tabela
    effective_date = db.Column(db.Date, nullable=False)
    expiration_date = db.Column(db.Date)
    category = db.Column(db.String(100), nullable=False)
    currency = db.Column(db.String(3), default='BRL')
    
    # Status do processo
    status = db.Column(db.String(30), default='submitted')  
    # submitted, under_review, pricing_analysis, commercial_review, 
    # director_review, vp_review, approved, rejected, expired
    
    # Dados financeiros
    total_items = db.Column(db.Integer, default=0)
    total_value = db.Column(db.Numeric(15, 2), default=0)
    previous_total_value = db.Column(db.Numeric(15, 2), default=0)
    impact_value = db.Column(db.Numeric(15, 2), default=0)  # Diferença em valor absoluto
    impact_percentage = db.Column(db.Numeric(5, 2), default=0)  # Diferença em percentual
    monthly_impact = db.Column(db.Numeric(15, 2), default=0)  # Impacto mensal estimado
    
    # Análise de margem
    current_margin = db.Column(db.Numeric(5, 2))  # Margem atual
    new_margin = db.Column(db.Numeric(5, 2))  # Nova margem calculada
    margin_impact = db.Column(db.Numeric(5, 2))  # Impacto na margem
    
    # Metadados do processo
    submitted_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    deadline = db.Column(db.DateTime)  # 30 dias a partir da submissão
    
    # Comentários e observações
    comments = db.Column(db.Text)
    rejection_reason = db.Column(db.Text)
    
    # Dados de auditoria
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    approvals = db.relationship('Approval', backref='cost_table', lazy=True, cascade='all, delete-orphan')
    cost_items = db.relationship('CostItem', backref='cost_table', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(CostTable, self).__init__(**kwargs)
        if not self.deadline:
            self.deadline = datetime.utcnow() + timedelta(days=30)
    
    @property
    def days_remaining(self):
        if self.deadline:
            delta = self.deadline - datetime.utcnow()
            return max(0, delta.days)
        return 0
    
    @property
    def is_overdue(self):
        return datetime.utcnow() > self.deadline if self.deadline else False
    
    def calculate_approval_level_required(self):
        """Determina o nível de aprovação necessário baseado no impacto financeiro"""
        monthly_impact = float(self.monthly_impact or 0)
        
        if monthly_impact <= 50000:
            return 'manager'
        elif monthly_impact <= 200000:
            return 'director'
        elif monthly_impact <= 500000:
            return 'vp'
        else:
            return 'full_chain'
    
    def to_dict(self):
        return {
            'id': self.id,
            'supplier_id': self.supplier_id,
            'version': self.version,
            'filename': self.filename,
            'file_size': self.file_size,
            'effective_date': self.effective_date.isoformat() if self.effective_date else None,
            'expiration_date': self.expiration_date.isoformat() if self.expiration_date else None,
            'category': self.category,
            'currency': self.currency,
            'status': self.status,
            'total_items': self.total_items,
            'total_value': float(self.total_value) if self.total_value else 0,
            'previous_total_value': float(self.previous_total_value) if self.previous_total_value else 0,
            'impact_value': float(self.impact_value) if self.impact_value else 0,
            'impact_percentage': float(self.impact_percentage) if self.impact_percentage else 0,
            'monthly_impact': float(self.monthly_impact) if self.monthly_impact else 0,
            'current_margin': float(self.current_margin) if self.current_margin else 0,
            'new_margin': float(self.new_margin) if self.new_margin else 0,
            'margin_impact': float(self.margin_impact) if self.margin_impact else 0,
            'submitted_by': self.submitted_by,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'days_remaining': self.days_remaining,
            'is_overdue': self.is_overdue,
            'comments': self.comments,
            'rejection_reason': self.rejection_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'approval_level_required': self.calculate_approval_level_required()
        }
    
    def __repr__(self):
        return f'<CostTable {self.filename} - {self.status}>'


class CostItem(db.Model):
    __tablename__ = 'cost_items'
    
    id = db.Column(db.Integer, primary_key=True)
    cost_table_id = db.Column(db.Integer, db.ForeignKey('cost_tables.id'), nullable=False)
    
    # Dados do produto/item
    sku = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(100))
    unit = db.Column(db.String(20), default='UN')  # UN, KG, L, etc.
    
    # Custos
    previous_cost = db.Column(db.Numeric(10, 4), default=0)
    new_cost = db.Column(db.Numeric(10, 4), nullable=False)
    cost_change = db.Column(db.Numeric(10, 4), default=0)
    cost_change_percentage = db.Column(db.Numeric(5, 2), default=0)
    
    # Dados de volume e impacto
    monthly_volume = db.Column(db.Numeric(10, 2), default=0)
    monthly_impact = db.Column(db.Numeric(12, 2), default=0)
    
    # Metadados
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def calculate_changes(self):
        """Calcula as mudanças de custo"""
        if self.previous_cost and self.new_cost:
            self.cost_change = self.new_cost - self.previous_cost
            if self.previous_cost > 0:
                self.cost_change_percentage = (self.cost_change / self.previous_cost) * 100
            
            if self.monthly_volume:
                self.monthly_impact = self.cost_change * self.monthly_volume
    
    def to_dict(self):
        return {
            'id': self.id,
            'cost_table_id': self.cost_table_id,
            'sku': self.sku,
            'description': self.description,
            'category': self.category,
            'unit': self.unit,
            'previous_cost': float(self.previous_cost) if self.previous_cost else 0,
            'new_cost': float(self.new_cost) if self.new_cost else 0,
            'cost_change': float(self.cost_change) if self.cost_change else 0,
            'cost_change_percentage': float(self.cost_change_percentage) if self.cost_change_percentage else 0,
            'monthly_volume': float(self.monthly_volume) if self.monthly_volume else 0,
            'monthly_impact': float(self.monthly_impact) if self.monthly_impact else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<CostItem {self.sku} - {self.description[:50]}>'

