import fs from 'fs';

let html = fs.readFileSync('Z:/backend/public/index.html', 'utf8');

const updatedCss = `
        /* ========================================================= */
        /* REDISEÑO OFICIAL TRABAJAYA: WORKSPACE CANDIDATO & SIDEBAR */
        /* ========================================================= */
        #vista-app {
            background: #FBFAFF !important;
            min-height: calc(100vh - 80px);
            padding: 0 !important;
        }

        .app-workspace-layout {
            display: flex;
            width: 100%;
            min-height: calc(100vh - 80px);
            background: #FBFAFF;
        }

        /* SIDEBAR OFICIAL (WFSide.dc.html) */
        .app-sidebar-official {
            width: 260px;
            min-width: 260px;
            background: #FFFFFF;
            border-right: 1px solid #E4DDF7;
            padding: 24px 16px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            box-sizing: border-box;
            position: sticky;
            top: 73px;
            height: calc(100vh - 73px);
            overflow-y: auto;
        }

        .app-sidebar-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 4px 8px;
            text-decoration: none;
            color: #23153C;
        }
        .app-sidebar-brand .logo-box {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            background: #D13A1C;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Bricolage Grotesque', sans-serif;
            font-weight: 800;
            font-size: 18px;
            transform: rotate(-6deg);
        }
        .app-sidebar-brand .brand-title {
            font-family: 'Bricolage Grotesque', sans-serif;
            font-weight: 800;
            font-size: 19px;
            letter-spacing: -0.03em;
        }
        .app-sidebar-brand .role-badge {
            font-size: 11px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 999px;
            border: 1px solid #E4DDF7;
            background: #F3F0FC;
            color: #5A4A7A;
        }

        .app-sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .app-side-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            border-radius: 12px;
            border: none;
            background: transparent;
            color: #4B3B6B;
            font-family: inherit;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            text-align: left;
            transition: all 0.15s ease;
            width: 100%;
        }
        .app-side-btn:hover {
            background: #F3F0FC;
            color: #23153C;
        }
        .app-side-btn.active {
            background: #23153C !important;
            color: #FFFFFF !important;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(35, 21, 60, 0.15);
        }

        .app-sidebar-footer {
            margin-top: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            border-top: 1px solid #E4DDF7;
            padding-top: 16px;
        }

        /* CONTENIDO PRINCIPAL */
        .app-main-content-official {
            flex: 1;
            padding: 32px 40px;
            max-width: 1300px;
            box-sizing: border-box;
            background: #FBFAFF;
            color: #23153C;
        }

        /* SOBREESCRIBIR ESTILOS DE MÓDULOS A PALETA OFICIAL CLARA */
        .module-card {
            background: #FFFFFF !important;
            border: 1px solid #E4DDF7 !important;
            border-radius: 24px !important;
            padding: 32px !important;
            box-shadow: 0 4px 20px rgba(35, 21, 60, 0.04) !important;
            color: #23153C !important;
        }
        .module-header {
            border-bottom: 1px solid #E4DDF7 !important;
            padding-bottom: 20px !important;
            margin-bottom: 24px !important;
        }
        .module-header h2 {
            color: #23153C !important;
            font-family: 'Bricolage Grotesque', sans-serif !important;
            font-size: 26px !important;
            font-weight: 800 !important;
        }
        .module-header p {
            color: #5A4A7A !important;
        }
`;

const insertIndex = html.indexOf('/* WORKSPACE HERRAMIENTAS */');
if (!html.includes('app-workspace-layout')) {
  html = html.slice(0, insertIndex) + updatedCss + '\n' + html.slice(insertIndex);
  fs.writeFileSync('Z:/backend/public/index.html', html, 'utf8');
  console.log('CSS oficial para layout del candidato y sidebar inyectado');
} else {
  console.log('CSS ya existía');
}
