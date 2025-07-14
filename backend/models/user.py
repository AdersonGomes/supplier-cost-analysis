from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Informações pessoais
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    
    # Informações organizacionais
    role = db.Column(db.String(50), nullable=False)
    # supplier, category_buyer, pricing_analyst, commercial_manager,
    # commercial_director, pricing_director, vp_commercial, admin
    
    department = db.Column(db.String(100))
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Configurações de aprovação
    approval_limit = db.Column(db.Numeric(15, 2), default=0)  # Limite de aprovação em valor
    can_delegate = db.Column(db.Boolean, default=False)
    categories = db.Column(db.Text)  # JSON array de categorias que pode aprovar
    
    # Status e configurações
    is_active = db.Column(db.Boolean, default=True)
    email_notifications = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    
    # Metadados
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    manager = db.relationship('User', remote_side=[id], backref='subordinates')
    submitted_tables = db.relationship('CostTable', foreign_keys='CostTable.submitted_by', backref='submitter')
    
    def set_password(self, password):
        """Define a senha do usuário"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica se a senha está correta"""
        return check_password_hash(self.password_hash, password)
    
    @property
    def full_name(self):
        """Retorna o nome completo do usuário"""
        return f"{self.first_name} {self.last_name}"
    
    def get_categories(self):
        """Retorna as categorias que o usuário pode aprovar"""
        import json
        return json.loads(self.categories) if self.categories else []
    
    def set_categories(self, categories):
        """Define as categorias que o usuário pode aprovar"""
        import json
        self.categories = json.dumps(categories)
    
    def can_approve_value(self, value):
        """Verifica se o usuário pode aprovar um valor específico"""
        return float(value) <= float(self.approval_limit or 0)
    
    def can_approve_category(self, category):
        """Verifica se o usuário pode aprovar uma categoria específica"""
        user_categories = self.get_categories()
        return not user_categories or category in user_categories
    
    def get_role_display(self):
        """Retorna o nome do role em português"""
        role_names = {
            'supplier': 'Fornecedor',
            'category_buyer': 'Comprador de Categoria',
            'pricing_analyst': 'Analista de Pricing',
            'commercial_manager': 'Gerente Comercial',
            'commercial_director': 'Diretor Comercial',
            'pricing_director': 'Diretor de Pricing',
            'vp_commercial': 'Vice Presidente Comercial',
            'admin': 'Administrador'
        }
        return role_names.get(self.role, self.role)
    
    def update_last_login(self):
        """Atualiza o timestamp do último login"""
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'phone': self.phone,
            'role': self.role,
            'role_display': self.get_role_display(),
            'department': self.department,
            'manager_id': self.manager_id,
            'approval_limit': float(self.approval_limit) if self.approval_limit else 0,
            'can_delegate': self.can_delegate,
            'categories': self.get_categories(),
            'is_active': self.is_active,
            'email_notifications': self.email_notifications,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_sensitive:
            data['password_hash'] = self.password_hash
        
        return data
    
    def __repr__(self):
        return f'<User {self.username} - {self.role}>'
