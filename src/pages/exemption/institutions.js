export const ALLOWED_INSTITUTIONS = [
  "Alberta University of the Arts",
  "Acadia University",
  "Algoma University",
  "Athabasca University",
  "Bishop's University",
  "Brandon University",
  "Brock University",
  "Cape Breton University",
  "Capilano University",
  "Carleton University",
  "Concordia University",
  "Dalhousie University",
  "Emily Carr University of Art and Design",
  "Kwantlen Polytechnic University",
  "Lakehead University",
  "MacEwan University",
  "Mount Royal University",
  "University of Alberta",
  "University of Calgary",
  "University of Lethbridge",
  "Royal Roads University",
  "Simon Fraser University",
  "Thompson Rivers University",
  "University of British Columbia",
  "University of Victoria",
  "University of the Fraser Valley",
  "University of Northern British Columbia",
  "Vancouver Island University",
  "University College of the North",
  "University of Manitoba",
  "Université de Saint-Boniface",
  "University of Winnipeg",
  "Mount Allison University",
  "St. Thomas University",
  "University of New Brunswick",
  "Université de Moncton",
  "Memorial University of Newfoundland",
  "Mount Saint Vincent University",
  "Nova Scotia College of Art and Design University",
  "Saint Francis Xavier University",
  "Saint Mary's University",
  "Université Sainte-Anne",
  "University of King's College",
  "Laurentian University",
  "McMaster University",
  "Nipissing University",
  "Ontario College of Art and Design University",
  "Queen's University at Kingston",
  "Royal Military College of Canada",
  "Toronto Metropolitan University",
  "Trent University",
  "Université de Hearst",
  "Université de l'Ontario français",
  "Université de Sudbury",
  "University of Guelph",
  "Ontario Tech University",
  "University of Ottawa",
  "University of Toronto",
  "University of Waterloo",
  "University of Western Ontario",
  "University of Windsor",
  "Wilfrid Laurier University",
  "York University",
  "University of Prince Edward Island",
  "École de technologie supérieure",
  "École nationale d'administration publique",
  "Institut national de la recherche scientifique",
  "McGill University",
  "Université de Montréal",
  "Université de Sherbrooke",
  "Université du Québec en Abitibi-Témiscamingue",
  "Université du Québec en Outaouais",
  "Université du Québec à Chicoutimi",
  "Université du Québec à Montréal",
  "Université du Québec à Rimouski",
  "Université du Québec à Trois-Rivières",
  "Université TÉLUQ",
  "Université Laval",
  "University of Regina",
  "University of Saskatchewan",
  "Yukon University",

  "ABM College of Health and Technology",
  "Bay River College",
  "Bow Valley College",
  "Keyano College",
  "Lakeland College",
  "Lethbridge Polytechnic",
  "MaKami College",
  "Medicine Hat College",
  "NorQuest College",
  "Northern Alberta Institute of Technology",
  "Northern Lakes College",
  "Northwestern Polytechnic",
  "Olds College",
  "Portage College",
  "Prairie College",
  "Red Crow Community College",
  "Red Deer Polytechnic",
  "Reeves College",
  "Robertson College",
  "Southern Alberta Institute of Technology",
  "Sundance College",
  "Acsenda School of Management",
  "Alexander College",
  "British Columbia Institute of Technology",
  "Cambria College",
  "Camosun College",
  "Coast Mountain College",
  "College of New Caledonia",
  "College of the Rockies",
  "Columbia College",
  "Cornerstone International Community College of Canada",
  "Create Career College",
  "Douglas College",
  "Educacentre College",
  "Eton College, Vancouver",
  "First College",
  "Langara College",
  "North Island College",
  "Northern Lights College",
  "Okanagan College",
  "Selkirk College",
  "Sprott Shaw College",
  "Vancouver Community College",
  "Vancouver Institute of Media Arts (VanArts)",
  "Assiniboine College",
  "Booth University College",
  "Manitoba Institute of Trades and Technology",
  "Menno Simons College",
  "Nations College of Canada",
  "Providence University College and Theological Seminary",
  "Red River College Polytechnic",
  "Robertson College",
  "St. Andrew's College",
  "St. John's College",
  "St. Paul's College",
  "Steinbach Bible College",
  "Sundance College Winnipeg",
  "École technique et professionnelle (operated under the Université de Saint-Boniface)",
  "University College of the North",
  "Yellowquill University College",
  "Collège communautaire du Nouveau-Brunswick",
  "Maritime College of Forest Technology",
  "McKenzie College",
  "New Brunswick College of Craft and Design",
  "New Brunswick Community College",
  "Oulton College",
  "College of the North Atlantic",
  "Aurora College",
  "Collège nordique francophone",
  "Canadian Coast Guard College",
  "Gaelic College",
  "Nova Scotia Community College",
  "Nunavut Arctic College",
  "Algonquin College",
  "Cambrian College",
  "Canadore College",
  "Centennial College",
  "Collège Boréal",
  "Conestoga College",
  "Confederation College",
  "Durham College",
  "Fanshawe College",
  "Fleming College",
  "George Brown College",
  "Georgian College",
  "Humber College",
  "La Cité collégiale",
  "Lambton College",
  "Loyalist College",
  "Mohawk College",
  "Niagara College",
  "Northern College",
  "St. Clair College",
  "St. Lawrence College",
  "Sault College",
  "Seneca College",
  "Sheridan College",
  "Collège de l'Île",
  "Holland College",
  "Cégep André-Laurendeau, LaSalle, Montreal",
  "Cégep Beauce-Appalaches, Saint-Georges",
  "Cégep de Baie-Comeau, Baie-Comeau",
  "Cégep de Chicoutimi, Chicoutimi, Saguenay",
  "Cégep de Drummondville, Drummondville",
  "Cégep de Granby-Haute-Yamaska, Granby",
  "Cégep de Jonquière, Jonquière, Saguenay",
  "Cégep de la Gaspésie et des Îles, Gaspé",
  "Cégep de La Pocatière, La Pocatière",
  "Cégep de l'Abitibi-Témiscamingue, Rouyn-Noranda",
  "Cégep de Lévis-Lauzon, Lévis",
  "Cégep de l'Outaouais, Hull, Gatineau",
  "Cégep de Matane, Matane",
  "Cégep de Rimouski, Rimouski",
  "Cégep de Rivière-du-Loup, Rivière-du-Loup",
  "Cégep de Saint-Félicien, Saint-Félicien",
  "Cégep de Saint-Hyacinthe, Saint-Hyacinthe",
  "Cégep de Saint-Jean-sur-Richelieu, Saint-Jean-sur-Richelieu",
  "Cégep de Saint-Jérôme, Saint-Jérôme",
  "Cégep de Saint-Laurent, Saint-Laurent, Montreal",
  "Cégep de Sainte-Foy, Sainte-Foy, Quebec City",
  "Cégep de Sept-Îles, Sept-Îles",
  "Cégep de Sherbrooke, 2e arrondissement, Sherbrooke",
  "Cégep de Sorel-Tracy, Sorel-Tracy",
  "Cégep de Thetford, Thetford Mines",
  "Cégep de Trois-Rivières, Trois-Rivières",
  "Cégep de Victoriaville, Victoriaville",
  "Cégep du Vieux Montréal, Ville-Marie (Quartier Latin), Montreal",
  "Cégep Édouard-Montpetit, Vieux-Longueuil, Longueuil",
  "Cégep Limoilou, Limoilou, Quebec City",
  "Cégep Marie-Victorin, Rivière-des-Prairies, Montreal",
  "Cégep régional de Lanaudière",
  "Champlain Regional College",
  "Collège Ahuntsic, Ahuntsic, Montreal",
  "Collège Canada, Montreal",
  "Collège d'Alma, Alma",
  "Collège de Bois-de-Boulogne, Cartierville, Montreal",
  "Collège de Maisonneuve, Hochelaga-Maisonneuve, Montreal",
  "Collège de Rosemont, Rosemont, Montreal",
  "Collège de Valleyfield, Salaberry-de-Valleyfield",
  "Collège François-Xavier-Garneau, La Cité, Quebec City",
  "Collège Gérald-Godin, Sainte-Geneviève, Montreal",
  "Collège Lionel-Groulx, Sainte-Thérèse",
  "Collège Montmorency, Laval",
  "Collège Shawinigan, Shawinigan",
  "Dawson College, Westmount, Montreal",
  "Heritage College, Hull, Gatineau",
  "Herzing College (Downtown), Montreal",
  "John Abbott College, Sainte-Anne-de-Bellevue, Montreal",
  "Vanier College, Saint-Laurent, Montreal",
  "Bethany College, Hepburn",
  "Briercrest College and Seminary, Caronport",
  "Carlton Trail College, Humboldt",
  "Horizon College and Seminary, Saskatoon",
  "College Mathieu, Gravelbourg (French language institution)",
  "Cumberland College, Nipawin, Tisdale, Melfort and Hudson Bay",
  "Eston College, Eston",
  "Great Plains College, various locations",
  "Lakeland College, Lloydminster",
  "Nipawin Bible College, Nipawin",
  "North West College, the Battlefords and Meadow Lake",
  "Northlands College, La Ronge, Buffalo Narrows and Creighton",
  "Parkland College, Melville",
  "St Peter's College, Muenster",
  "Saskatchewan Indian Institute of Technologies, various",
  "Saskatchewan Polytechnic, Moose Jaw, Prince Albert, Regina, Saskatoon",
  "Southeast College, Weyburn",
  "Western Academy Broadcasting College, Saskatoon",
  "Yukon School of Visual Arts",


];

export const INSTITUTIONAL_EMAIL_DOMAINS = [
  	
	"acadiau.ca",
		
	"assumptionu.ca",
		
	"athabascau.ca",
		
	"bcit.ca",
		
	"bcou.ca",
		
	"boothcollege.ca",
		
	"bowvalleycollege.ca",
		
	"brandonu.ca",
		
	"brocku.ca",
		
	"capilanou.ca",
		
	"carleton.ca",
		
	"cbu.ca",
		
	"ccbc.ca",
		
	"cegepdrummond.ca",
		
	"cegepmontpetit.ca",
		
	"centennialcollege.ca",
		
	"citecollegiale.ca",
		
	"columbiacollege.ca",
		
	"concordia.ca",
		
	"cus.ca",
		
	"cuslm.ca",
		
	"dal.ca",
		
	"devry.ca",
		
	"ecuad.ca",
		
	"etsmtl.ca",
		
	"fanshaweonline.ca",
		
	"firstnationsuniversity.ca",
		
	"hec.ca",
		
	"humbermail.ca",
		
	"inrs.ca",
		
	"lakeheadu.ca",
		
	"laurentian.ca",
		
	"mcgill.ca",
		
	"mcmaster.ca",
		
	"mohawkcollege.ca",
		
	"msvu.ca",
		
	"mta.ca",
		
	"mun.ca",
		
	"myseneca.ca",
		
	"mytru.ca",
		
	"nait.ca",
		
	"nbcc.ca",
		
	"nipissingu.ca",
		
	"nscc.ca",
		
	"ocad.ca",
		
	"polymtl.ca",
		
	"queensu.ca",
		
	"questu.ca",
		
	"redeemer.ca",
		
	"rmc.ca",
		
	"royalroads.ca",
		
	"rrc.ca",
		
	"ryerson.ca",
		
	"sait.ca",
		
	"saskpolytech.ca",
		
	"saultcollege.ca",
		
	"sfu.ca",
		
	"stfx.ca",
		
	"stmarys.ca",
		
	"stthomasu.ca",
		
	"stu.ca",
		
	"trentu.ca",
		
	"tru.ca",
		
	"twu.ca",
		
	"ualberta.ca",
		
	"ubc.ca",
		
	"ubishops.ca",
		
	"ucalgary.ca",
		
	"ufv.ca",
		
	"ulaval.ca",
		
	"uleth.ca",
		
	"umanitoba.ca",
		
	"umoncton.ca",
		
	"umontreal.ca",
		
	"unb.ca",
		
	"unbc.ca",
		
	"unbsj.ca",
		
	"universitycanadawest.ca",
		
	"uoguelph.ca",
		
	"uoit.ca",
		
	"uottawa.ca",
		
	"upei.ca",
		
	"uqac.ca",
		
	"uqam.ca",
		
	"uqo.ca",
		
	"uqtr.ca",
		
	"uquebec.ca",
		
	"uregina.ca",
		
	"usask.ca",
		
	"usherb.ca",
		
	"usherbrooke.ca",
		
	"ustpaul.ca",
		
	"utoronto.ca",
		
	"uvic.ca",
		
	"uwaterloo.ca",
		
	"uwindsor.ca",
		
	"uwinnipeg.ca",
		
	"uwo.ca",
		
	"vcc.ca",
		
	"viu.ca",
		
	"wlu.ca",
		
	"yorku.ca",
		
];