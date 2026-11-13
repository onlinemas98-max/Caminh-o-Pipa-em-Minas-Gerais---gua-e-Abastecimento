
(function(){
  const phoneMap = {"Bocaiúva": "5538991931055", "Curvelo": "5531991217493", "Francisco Sá": "5535987072628", "Janaúba": "5581999847138", "Januária": "5531999568267", "Montes Claros": "5535987072628", "Pirapora": "5538999568267", "Salinas": "5535987072628", "Taiobeiras": "5535987072628"};
  const $ = (s, root=document) => root.querySelector(s);
  const form = $('#quote-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const data = new FormData(form);
      const city = data.get('city');
      const phone = phoneMap[city];
      if(!phone){ alert('Selecione uma cidade válida.'); return; }
      const message = `Olá! Meu nome é ${data.get('name')}. Telefone: ${data.get('phone')}. Cidade: ${city} - MG. Tipo de abastecimento: ${data.get('type')}. Mensagem: ${data.get('message')}. Gostaria de solicitar um orçamento de caminhão-pipa.`;
      window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(message), '_blank', 'noopener');
    });
  }
  const login = $('#admin-login');
  if(login){
    login.addEventListener('submit', async function(e){
      e.preventDefault();
      const pin = $('#admin-pin').value;
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
      const actual = Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
      if(actual === '425d61997bf9249a378f324165669789330dc80ea3215486b0f02b1ed1750796'){ $('#admin-area').classList.remove('admin-hidden'); $('#login-area').classList.add('admin-hidden'); renderLeads(); }
      else { $('#login-error').textContent = 'Senha incorreta.'; }
    });
  }
  function getLeads(){ try{return JSON.parse(localStorage.getItem('caminhaoPipaLeads')||'[]')}catch(e){return []} }
  function renderLeads(){
    const list = $('#lead-list'); if(!list)return;
    const leads=getLeads();
    list.innerHTML='';
    if(!leads.length){list.textContent='Nenhuma solicitação foi registrada neste navegador.';return;}
    leads.slice().reverse().forEach((lead,index)=>{
      const article=document.createElement('article'); article.className='lead';
      const title=document.createElement('strong'); title.textContent=lead.name+' — '+lead.city;
      const date=document.createElement('small'); date.textContent=' '+lead.date;
      const body=document.createElement('p'); body.textContent='Telefone: '+lead.phone+' | Tipo: '+lead.type+' | Mensagem: '+lead.message;
      const del=document.createElement('button'); del.className='btn danger'; del.type='button'; del.textContent='Excluir registro';
      del.addEventListener('click',()=>{const current=getLeads();current.splice(current.length-1-index,1);localStorage.setItem('caminhaoPipaLeads',JSON.stringify(current));renderLeads();});
      article.append(title,date,body,del);list.append(article);
    });
  }
  const exportBtn=$('#export-leads');
  if(exportBtn)exportBtn.addEventListener('click',()=>{const blob=new Blob([JSON.stringify(getLeads(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='solicitacoes-caminhao-pipa.json';a.click();URL.revokeObjectURL(a.href);});
  const clearBtn=$('#clear-leads');
  if(clearBtn)clearBtn.addEventListener('click',()=>{if(confirm('Excluir todos os registros deste navegador?')){localStorage.removeItem('caminhaoPipaLeads');renderLeads();}});
})();
