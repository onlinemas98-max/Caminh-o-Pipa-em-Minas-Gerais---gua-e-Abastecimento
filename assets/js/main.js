/* Centralized JavaScript - Caminhão Pipa MG */

const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

function loadGA4() {
    if (window.gaLoaded) return;
    window.gaLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
}

document.addEventListener("DOMContentLoaded", function() {
    const consentStatus = localStorage.getItem("cookie_consent");
    
    if (!consentStatus) {
        createCookieBanner();
    } else if (consentStatus === "accepted") {
        loadGA4();
    }

    const form = document.getElementById("orcamento-form");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            const nome = document.getElementById("nome").value.trim();
            const telefone = document.getElementById("telefone").value.trim();
            const cidade = document.getElementById("cidade").value;
            const servico = document.getElementById("servico").value;
            const mensagem = document.getElementById("mensagem").value.trim();

            if (!nome || !telefone || !cidade || !servico) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                return;
            }

            const whatsappNumbers = {
                "Janaúba": "5581999847138",
                "Pirapora": "5538999568267",
                "Januária": "5531999568267",
                "Curvelo": "5531991217493",
                "Bocaiúva": "5538991931055",
                "Salinas": "5535987072628",
                "Taiobeiras": "5535987072628",
                "Francisco Sá": "5535987072628",
                "Montes Claros": "5535987072628"
            };

            const numeroDestino = whatsappNumbers[cidade] || "5538999568267";
            const textoMsg = `Olá! Gostaria de solicitar um orçamento para atendimento em ${cidade} - MG.\n*Nome:* ${nome}\n*Telefone:* ${telefone}\n*Serviço:* ${servico}\n*Mensagem:* ${mensagem}`;
            
            const leads = JSON.parse(localStorage.getItem("admin_leads") || "[]");
            leads.push({
                nome: nome,
                telefone: telefone,
                cidade: cidade,
                servico: servico,
                mensagem: mensagem,
                data: new Date().toLocaleDateString('pt-BR'),
                status: 'Pendente'
            });
            localStorage.setItem("admin_leads", JSON.stringify(leads));

            trackWhatsAppClick(cidade, numeroDestino, "formulario_orcamento", "Enviar Solicitação via WhatsApp");

            const url = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(textoMsg)}`;
            window.open(url, "_blank");
        });
    }

    document.querySelectorAll("a[href*='wa.me']").forEach(link => {
        link.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            const match = href.match(/wa\.me\/55(\d+)/);
            const phone = match ? "55" + match[1] : "Desconhecido";
            
            let city = "Geral";
            const path = window.location.pathname;
            if (path.includes("bocaiuva")) city = "Bocaiúva";
            else if (path.includes("curvelo")) city = "Curvelo";
            else if (path.includes("francisco-sa")) city = "Francisco Sá";
            else if (path.includes("janauba")) city = "Janaúba";
            else if (path.includes("januaria")) city = "Januária";
            else if (path.includes("montes-claros")) city = "Montes Claros";
            else if (path.includes("pirapora")) city = "Pirapora";
            else if (path.includes("salinas")) city = "Salinas";
            else if (path.includes("taiobeiras")) city = "Taiobeiras";
            else if (href.includes("5581999847138")) city = "Janaúba";
            else if (href.includes("5538999568267")) city = "Pirapora";
            else if (href.includes("5531999568267")) city = "Januária";
            else if (href.includes("5531991217493")) city = "Curvelo";
            else if (href.includes("5538991931055")) city = "Bocaiúva";
            else if (href.includes("5535987072628")) city = "Montes Claros";

            const buttonLocation = this.closest(".card") ? "card" : (this.closest(".hero") ? "hero" : "content_or_footer");
            const buttonText = this.innerText.trim();

            trackWhatsAppClick(city, href, buttonLocation, buttonText);
        });
    });
});

function createCookieBanner() {
    const banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.innerHTML = `
        <p>Utilizamos cookies e tecnologias de análise (GA4) para melhorar sua experiência e analisar o tráfego. Consulte nossa <a href="${getRootPath()}politica-de-privacidade.html" target="_blank">Política de Privacidade</a>.</p>
        <div class="cookie-buttons">
            <button class="btn-cookie btn-accept" onclick="acceptCookies()">Aceitar</button>
            <button class="btn-cookie btn-reject" onclick="rejectCookies()">Rejeitar</button>
        </div>
    `;
    document.body.appendChild(banner);
}

function acceptCookies() {
    localStorage.setItem("cookie_consent", "accepted");
    const banner = document.getElementById("cookie-banner");
    if (banner) banner.remove();
    loadGA4();
}

function rejectCookies() {
    localStorage.setItem("cookie_consent", "rejected");
    const banner = document.getElementById("cookie-banner");
    if (banner) banner.remove();
}

function getRootPath() {
    return window.location.pathname.includes("/cidades/") ? "../" : "";
}

function trackWhatsAppClick(city, phone, buttonLocation, buttonText) {
    const consent = localStorage.getItem("cookie_consent");
    
    const history = JSON.parse(localStorage.getItem("whatsapp_click_history") || "[]");
    history.push({
        city: city,
        phone: phone,
        page_location: window.location.href,
        page_title: document.title,
        button_location: buttonLocation,
        button_text: buttonText,
        date: new Date().toISOString()
    });
    localStorage.setItem("whatsapp_click_history", JSON.stringify(history));

    if (consent === "accepted" && typeof window.gtag === "function") {
        window.gtag('event', 'whatsapp_click', {
            'city': city,
            'phone': phone,
            'page_location': window.location.href,
            'page_title': document.title,
            'button_location': buttonLocation,
            'button_text': buttonText
        });
    }
}
