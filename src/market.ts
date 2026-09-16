const marketChoices=['Farm Produce','Product','My Skill/Service','Business Customers','Where Can I Sell?','Understand My Market'] as const;
let selectedMarket='';

const mic=()=>`<button class="mic" type="button" aria-label="Voice input"><span aria-hidden="true">●</span> Any Indian language</button>`;
const marketNav=(backId:string)=>`<nav class="nav" aria-label="Navigation"><button id="${backId}" type="button">← Back