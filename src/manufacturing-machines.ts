export type MachineOpportunity={name:string;budget:'₹20,000 band'|'₹50,000 band'|'₹1,00,000 band';use:string;research:string[]};
export const machineBudgets=['₹20,000 band','₹50,000 band','₹1,00,000 band','Other / enter manually'] as const;
export const manufacturingMachines:MachineOpportunity[]=[
{name:'Paper plate / dona making setup',budget:'₹50,000 band',use:'Disposable paper-product production',research:['Machine capacity and power','Raw-paper availability and unit economics','Local institutional/retail demand']},
{name:'Manual / compact pouch sealing setup',budget:'₹20,000 band',use:'Small-product packaging',research:['Pack material compatibility','Throughput and power','Food/non-food compliance context']},
{name:'Spice grinding / pulverizer setup',budget:'₹50,000 band',use:'Small spice-processing operation',research:['Food-grade contact and cleaning','Input quality, wastage and power','Packaging, food-safety and demand']},
{name:'Flour / grain milling setup',budget:'₹1,00,000 band',use:'Small milling service or packaged output',research:['Capacity and motor/power needs','Grain sourcing and yield','Local service/product demand and applicable rules']},
{name:'Oil extraction / mini expeller setup',budget:'₹1,00,000 band',use:'Small edible/non-edible oil processing',research:['Seed compatibility and recovery','Power, filtration and by-products','Food-safety requirements where edible']},
{name:'Incense-stick production setup',budget:'₹50,000 band',use:'Agarbatti production',research:['Input mix and machine capacity','Drying/finishing and labour','Wholesale/retail distribution']},
{name:'Candle making setup',budget:'₹20,000 band',use:'Small candle production',research:['Wax/mould/input costs','Safety and batch capacity','Seasonal and institutional demand']},
{name:'Detergent / liquid mixing setup',budget:'₹50,000 band',use:'Small cleaning-product production',research:['Formulation and safe handling','Packaging and batch economics','Labelling and applicable requirements']},
{name:'Small packing / weighing setup',budget:'₹20,000 band',use:'Measured packing for suitable products',research:['Accuracy requirements','Pack sizes and throughput','Product-specific compliance']},
{name:'Compact heat press setup',budget:'₹50,000 band',use:'Customized textile/product printing',research:['Consumables and transfer compatibility','Design/IP rights and capacity','Customer acquisition and order economics']},
{name:'Small sewing / finishing workstation',budget:'₹20,000 band',use:'Textile stitching and finishing',research:['Machine type versus product','Fabric/thread and labour time','Local/B2B demand']},
{name:'Paper bag making setup',budget:'₹50,000 band',use:'Paper carry-bag production',research:['Paper/GSM compatibility','Capacity and adhesive/handle process','Retail/B2B demand']},
{name:'Mini food dehydrator setup',budget:'₹50,000 band',use:'Suitable dried-food processing',research:['Temperature/capacity and yield','Energy, packaging and shelf-life validation','Food-safety requirements']},
{name:'Small vacuum packing setup',budget:'₹50,000 band',use:'Suitable product packaging',research:['Product compatibility','Consumable pouch cost and throughput','Shelf-life claims require validation']},
{name:'Compact label / sticker production setup',budget:'₹1,00,000 band',use:'Small label-printing service',research:['Printer/cutter capability','Media/ink and maintenance costs','B2B customer volume and design rights']}
];
export const affiliatePolicy='Seller names, live prices and affiliate links remain disabled until each commercial source is verified. Future affiliate links must be clearly labelled, separable from research, and must not change comparison or calculation results.';
