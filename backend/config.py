"""
Configurações do Sistema de Análise de Custos
Compatível com Windows, Linux e macOS
"""

import os
from pathlib import Path

class Config:
    """Configurações base do sistema"""
    
    # Diretório base (onde está este arquivo)
    BASE_DIR = Path(__file__).parent.absolute()
    
    # Configurações de segurança
    SECRET_KEY = os.environ.get('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')
    
    # Configurações de banco de dados
    DATABASE_DIR = BASE_DIR / 'database'
    DATABASE_PATH = DATABASE_DIR / 'app.db'
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{DATABASE_PATH}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configurações de upload
    UPLOAD_DIR = BASE_DIR / 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'csv'}
    
    # Configurações de servidor
    HOST = '0.0.0.0'
    PORT = 5000
    DEBUG = True
    
    # Configurações de CORS
    CORS_ORIGINS = ['*']
    
    @classmethod
    def init_app(cls, app):
        """Inicializar configurações na aplicação Flask"""
        # Criar diretórios necessários
        cls.DATABASE_DIR.mkdir(exist_ok=True)
        cls.UPLOAD_DIR.mkdir(exist_ok=True)
        
        # Configurar Flask
        app.config['SECRET_KEY'] = cls.SECRET_KEY
        app.config['SQLALCHEMY_DATABASE_URI'] = cls.SQLALCHEMY_DATABASE_URI
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = cls.SQLALCHEMY_TRACK_MODIFICATIONS
        app.config['MAX_CONTENT_LENGTH'] = cls.MAX_CONTENT_LENGTH
        app.config['UPLOAD_FOLDER'] = str(cls.UPLOAD_DIR)

class DevelopmentConfig(Config):
    """Configurações para desenvolvimento"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Configurações para produção"""
    DEBUG = False
    TESTING = False
    
    # Configurações de segurança para produção
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

class TestingConfig(Config):
    """Configurações para testes"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

# Mapeamento de configurações
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Obter configuração baseada na variável de ambiente"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])

