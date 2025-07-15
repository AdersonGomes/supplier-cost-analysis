import os
import sys
from pathlib import Path

# Adicionar o diretório backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from flask import Flask, send_from_directory
from flask_cors import CORS

# Imports dos modelos (sem src.)
from models.user import db, User
from models.supplier import Supplier
from models.cost_table import CostTable, CostItem
from models.approval import Approval, ApprovalTemplate

# Imports das rotas (sem src.)
from routes.user import user_bp
from routes.auth import auth_bp
from routes.supplier import supplier_bp
from routes.cost_table import cost_table_bp
from routes.approval import approval_bp
from routes.dashboard import dashboard_bp

def create_app():
    """Factory function para criar a aplicação Flask"""
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

    # Configuração CORS para permitir acesso do frontend
    CORS(app, origins=['*'])

    # Configuração de upload de arquivos
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')

    # Criar pastas necessárias
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), 'database'), exist_ok=True)

    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(supplier_bp, url_prefix='/api/suppliers')
    app.register_blueprint(cost_table_bp, url_prefix='/api/cost-tables')
    app.register_blueprint(approval_bp, url_prefix='/api/approvals')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    # Configuração do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)

    with app.app_context():
        db.create_all()
        
        # Criar usuário admin padrão se não existir
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@empresa.com',
                first_name='Administrador',
                last_name='Sistema',
                role='admin',
                department='TI',
                approval_limit=999999999,
                can_delegate=True,
                is_active=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Usuário admin criado com sucesso!")

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        static_folder_path = app.static_folder
        if static_folder_path is None:
            return "Static folder not configured", 404

        if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
            return send_from_directory(static_folder_path, path)
        else:
            index_path = os.path.join(static_folder_path, 'index.html')
            if os.path.exists(index_path):
                return send_from_directory(static_folder_path, 'index.html')
            else:
                return "index.html not found", 404

    return app

# Criar a aplicação
app = create_app()

if __name__ == '__main__':
    print("Iniciando Sistema de Análise de Custos...")
    print("URL: http://localhost:5000")
    print("Usuário: admin")
    print("Senha: admin123")
    app.run(host='0.0.0.0', port=5000, debug=True)
