/**
 * Injeta a Sidebar e o botão do Menu
 */
function injectSidebar() {
    // Inject Hamburger button before the logo/photo
    const headers = document.querySelectorAll('header .flex.items-center.gap-3');
    headers.forEach(headerBlock => {
        if (!headerBlock.querySelector('.menu-btn')) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'menu-btn p-2 mr-1 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center active:scale-95';
            menuBtn.innerHTML = '<span class="material-symbols-outlined text-slate-700">menu</span>';
            menuBtn.onclick = openSidebar;
            headerBlock.insertBefore(menuBtn, headerBlock.firstChild);
        }
    });

    const sidebarHTML = `
    <div id="appSidebar" class="fixed inset-0 z-[110] hidden bg-black/50 backdrop-blur-sm transition-opacity opacity-0">
        <div class="w-80 max-w-[80vw] h-full bg-white shadow-2xl transform -translate-x-full transition-transform flex flex-col">
            <div class="p-6 border-b border-[#EEF2F5] flex justify-between items-center bg-primary text-white">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-3xl">account_circle</span>
                    <div>
                        <h2 class="font-bold truncate w-40" id="sidebarProfName">Dr(a).</h2>
                        <p class="text-xs opacity-80">Perfil e Configurações</p>
                    </div>
                </div>
                <button id="closeSidebarBtn" class="p-2 rounded-full hover:bg-white/20 transition-colors flex">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto py-4">
                <div class="px-4 space-y-1">
                    <button class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left" onclick="alert('Funcionalidade de trocar foto e horários em breve!')">
                        <span class="material-symbols-outlined text-primary">manage_accounts</span>
                        <span class="font-semibold text-on-surface">Perfil e Horários</span>
                    </button>
                    
                    <a href="https://wa.me/5521992341112" target="_blank" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left">
                        <span class="material-symbols-outlined text-green-600">support_agent</span>
                        <span class="font-semibold text-on-surface">Suporte (WhatsApp)</span>
                    </a>
                    
                    <button class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left" onclick="exportReport()">
                        <span class="material-symbols-outlined text-blue-600">download</span>
                        <span class="font-semibold text-on-surface">Exportar Relatório</span>
                    </button>
                </div>
            </div>

            <div class="p-4 border-t border-[#EEF2F5]">
                <button onclick="logout()" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-error/10 text-error transition-colors text-left font-bold">
                    <span class="material-symbols-outlined">logout</span>
                    <span>Sair</span>
                </button>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', sidebarHTML);

    const sidebar = document.getElementById('appSidebar');
    const sidebarInner = sidebar.querySelector('div');
    const closeBtn = document.getElementById('closeSidebarBtn');

    function openSidebar() {
        if(currentProfessionalName) {
            document.getElementById('sidebarProfName').innerText = currentProfessionalName;
        }
        sidebar.classList.remove('hidden');
        setTimeout(() => {
            sidebar.classList.remove('opacity-0');
            sidebarInner.classList.remove('-translate-x-full');
        }, 10);
    }

    function closeSidebar() {
        sidebar.classList.add('opacity-0');
        sidebarInner.classList.add('-translate-x-full');
        setTimeout(() => {
            sidebar.classList.add('hidden');
        }, 300);
    }

    closeBtn.addEventListener('click', closeSidebar);
    sidebar.addEventListener('click', (e) => {
        if (e.target === sidebar) closeSidebar();
    });

    window.openSidebar = openSidebar;
    
    // Config do SweetAlert para exportar relatório
    window.exportReport = function() {
        Swal.fire({
            title: 'Exportar Relatório',
            text: 'Deseja exportar o relatório de qual período?',
            icon: 'question',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Hoje',
            denyButtonText: 'Semana',
            cancelButtonText: 'Mês',
            confirmButtonColor: '#005258',
        }).then((result) => {
            let period = '';
            if (result.isConfirmed) period = 'Hoje';
            else if (result.isDenied) period = 'Semana';
            else if (result.dismiss === Swal.DismissReason.cancel) period = 'Mês';
            
            if(period) {
                Swal.fire('Gerando...', \`O relatório de \${period} está sendo gerado.\`, 'success');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth().then(() => {
        injectSidebar();
    });
});
