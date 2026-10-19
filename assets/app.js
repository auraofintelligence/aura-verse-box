const menu=document.querySelector('.all-pages');
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus();}});
document.addEventListener('click',event=>{if(menu?.open&&!menu.contains(event.target))menu.open=false;});
document.querySelectorAll('[data-filter]').forEach(input=>{
 const list=document.getElementById(input.dataset.filter);
 const items=[...list.children];
 const empty=document.querySelector(`[data-empty="${list.id}"]`);
 input.addEventListener('input',()=>{const query=input.value.trim().toLocaleLowerCase('en-AU');let count=0;for(const item of items){item.hidden=!item.textContent.toLocaleLowerCase('en-AU').includes(query);if(!item.hidden)count++;}if(empty)empty.hidden=count!==0;});
});
