const addresses = {
    search: 'https://tmdb.elfhosted.com/N4IgNghgdg5grhGBTEAuEAXATgWgCoBKIANCAMYQYRgD2MAzmgNoC6pWSGcWUAkgLYATAEa9BaTFjgpSFehgDCNOFAxoATAAYAvkA/manifest.json',
    home: 'https://raw.githubusercontent.com/dr-octagon/Nuvio/main/manifest.json',
    cinemeta: 'https://v3-cinemeta.strem.io/manifest.json'
};
for (const id of ['search', 'home']) {
    document.getElementById(id + '-install').href = addresses[id].replace(/^https:\/\//, 'nuvio://');
}
for (const button of document.querySelectorAll('[data-copy]')) {
    button.addEventListener('click', async () => {
        const id = button.dataset.copy, address = addresses[id], status = document.getElementById(id + '-status');
        try {
            await navigator.clipboard.writeText(address);
            status.textContent = 'Adres kopyalandı. Nuvio’daki Eklenti ekle bölümüne yapıştır.';
        } catch (_) {
            status.replaceChildren();
            const input = document.createElement('input'); input.value = address; input.readOnly = true; input.setAttribute('aria-label', 'Kopyalanacak manifest adresi');
            input.style.width = '100%'; status.appendChild(input); input.focus(); input.select();
        }
    });
}
