// Personajes ilustrados: primero se usan las imagenes locales de /img (creadas
// a mano), si no estan se baja el arte de Wikimedia. Si ambas fallan, emoji.
// Nombres de archivo locales: img/<id>.png (tambien acepta .jpg o .webp).
(function () {
  "use strict";
  var OU = window.OU = window.OU || {};
  OU.IMG = {
  "hop": ["img/hop.png", "img/hop.jpg", "img/hop.webp", "https://upload.wikimedia.org/wikipedia/commons/b/b0/Hoplite1.gif"],
  "gt": ["img/gt.png", "img/gt.jpg", "img/gt.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Hector_Cassandra_Pomarici_Santomasi.jpg/330px-Hector_Cassandra_Pomarici_Santomasi.jpg"],
  "arq": ["img/arq.png", "img/arq.jpg", "img/arq.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Troilus_and_Cressida%2C_Act_I%2C_Scene_2_%2884341372%29.jpg/330px-Troilus_and_Cressida%2C_Act_I%2C_Scene_2_%2884341372%29.jpg"],
  "pela": ["img/pela.png", "img/pela.jpg", "img/pela.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Agrianian3.jpg/330px-Agrianian3.jpg"],
  "sat": ["img/sat.png", "img/sat.jpg", "img/sat.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Satyros_Cdm_Paris_DeRidder509.jpg/330px-Satyros_Cdm_Paris_DeRidder509.jpg"],
  "delf": ["img/delf.png", "img/delf.jpg", "img/delf.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Eug%C3%A8ne_Delacroix_-_Lycurgus_Consulting_the_Pythia_-_Google_Art_Project.jpg/330px-Eug%C3%A8ne_Delacroix_-_Lycurgus_Consulting_the_Pythia_-_Google_Art_Project.jpg"],
  "gc": ["img/gc.png", "img/gc.jpg", "img/gc.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Syriskos_Painter_-_ARV_259_1_-_Theseus_killing_the_Minotauros_in_the_presence_of_Minos_and_Ariadne_and_lookers_-_Athens_NAM_15115.jpg/330px-Syriskos_Painter_-_ARV_259_1_-_Theseus_killing_the_Minotauros_in_the_presence_of_Minos_and_Ariadne_and_lookers_-_Athens_NAM_15115.jpg"],
  "mirm": ["img/mirm.png", "img/mirm.jpg", "img/mirm.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Akhilleus_Patroklos_Antikensammlung_Berlin_F2278.jpg/330px-Akhilleus_Patroklos_Antikensammlung_Berlin_F2278.jpg"],
  "aqu": ["img/aqu.png", "img/aqu.jpg", "img/aqu.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Achilles_fighting_against_Memnon_Leiden_Rijksmuseum_voor_Oudheden.jpg/330px-Achilles_fighting_against_Memnon_Leiden_Rijksmuseum_voor_Oudheden.jpg"],
  "her": ["img/her.png", "img/her.jpg", "img/her.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Hercules_combatant_Achelous_%288655488835%29.jpg/330px-Hercules_combatant_Achelous_%288655488835%29.jpg"],
  "per": ["img/per.png", "img/per.jpg", "img/per.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Perseo_con_la_testa_di_medusa%2C_originale_di_et%C3%A0_flavia_o_traianea%2C_dalle_terme_presso_porta_laurentina%2C_01.JPG/330px-Perseo_con_la_testa_di_medusa%2C_originale_di_et%C3%A0_flavia_o_traianea%2C_dalle_terme_presso_porta_laurentina%2C_01.JPG"],
  "tes": ["img/tes.png", "img/tes.jpg", "img/tes.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Kylix_Theseus_Aison_MNA_Inv11365_n1.jpg/330px-Kylix_Theseus_Aison_MNA_Inv11365_n1.jpg"],
  "uli": ["img/uli.png", "img/uli.jpg", "img/uli.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Head_Odysseus_MAR_Sperlonga.jpg/330px-Head_Odysseus_MAR_Sperlonga.jpg"],
  "ata": ["img/ata.png", "img/ata.jpg", "img/ata.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Atalanta_Lekythos%2C_500-490_BC%2C_Greek%2C_Attic%2C_attributed_to_Douris%2C_ceramic_-_Cleveland_Museum_of_Art_-_DSC08212.JPG/330px-Atalanta_Lekythos%2C_500-490_BC%2C_Greek%2C_Attic%2C_attributed_to_Douris%2C_ceramic_-_Cleveland_Museum_of_Art_-_DSC08212.JPG"],
  "orf": ["img/orf.png", "img/orf.jpg", "img/orf.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/DSC00355_-_Orfeo_%28epoca_romana%29_-_Foto_G._Dall%27Orto.jpg/330px-DSC00355_-_Orfeo_%28epoca_romana%29_-_Foto_G._Dall%27Orto.jpg"],
  "and": ["img/and.png", "img/and.jpg", "img/and.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Perseus_Andromeda_MAN_Napoli_Inv8998.jpg/330px-Perseus_Andromeda_MAN_Napoli_Inv8998.jpg"],
  "jas": ["img/jas.png", "img/jas.jpg", "img/jas.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Douris_cup_Jason_Vatican_16545.jpg/330px-Douris_cup_Jason_Vatican_16545.jpg"],
  "zus": ["img/zus.png", "img/zus.jpg", "img/zus.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Zeus_Otricoli_Pio-Clementino_Inv257.jpg/330px-Zeus_Otricoli_Pio-Clementino_Inv257.jpg"],
  "pos": ["img/pos.png", "img/pos.jpg", "img/pos.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Statue_of_Poseidon_NAMA_235_%28DerHexer%29%2C_part_2.JPG/330px-Statue_of_Poseidon_NAMA_235_%28DerHexer%29%2C_part_2.JPG"],
  "had": ["img/had.png", "img/had.jpg", "img/had.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Persephone_Hades_BM_Vase_E82_%28cropped%29.jpg/330px-Persephone_Hades_BM_Vase_E82_%28cropped%29.jpg"],
  "ate": ["img/ate.png", "img/ate.jpg", "img/ate.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Mattei_Athena_Louvre_Ma530_n2.jpg/330px-Mattei_Athena_Louvre_Ma530_n2.jpg"],
  "ars": ["img/ars.png", "img/ars.jpg", "img/ars.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/%CE%9F_%CE%86%CF%81%CE%B7%CF%82_%28Borghese-%CE%9B%CE%BF%CF%8D%CE%B2%CF%81%CE%BF%CF%85%29.jpg/330px-%CE%9F_%CE%86%CF%81%CE%B7%CF%82_%28Borghese-%CE%9B%CE%BF%CF%8D%CE%B2%CF%81%CE%BF%CF%85%29.jpg"],
  "art": ["img/art.png", "img/art.jpg", "img/art.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Diane_de_Versailles_-_Mus%C3%A9e_du_Louvre_AGER_Ma_589.jpg/330px-Diane_de_Versailles_-_Mus%C3%A9e_du_Louvre_AGER_Ma_589.jpg"],
  "hef": ["img/hef.png", "img/hef.jpg", "img/hef.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Hephaistos_Thetis_at_Kylix_by_the_Foundry_Painter_Antikensammlung_Berlin_F2294.jpg/330px-Hephaistos_Thetis_at_Kylix_by_the_Foundry_Painter_Antikensammlung_Berlin_F2294.jpg"],
  "apo": ["img/apo.png", "img/apo.jpg", "img/apo.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Italy-3104_-_Apollo_%285378415112%29.jpg/330px-Italy-3104_-_Apollo_%285378415112%29.jpg"],
  "cro": ["img/cro.png", "img/cro.jpg", "img/cro.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Rhea_handing_a_swaddled_stone_to_Cronus%2C_Attic_terracotta_pelike%2C_c._460%E2%80%93450_BC%2C_Met_06.1021.144.jpg_%28cropped%29.jpg/330px-Rhea_handing_a_swaddled_stone_to_Cronus%2C_Attic_terracotta_pelike%2C_c._460%E2%80%93450_BC%2C_Met_06.1021.144.jpg_%28cropped%29.jpg"],
  "oce": ["img/oce.png", "img/oce.jpg", "img/oce.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Oceanus_Mosaic_from_Antioch.jpg/330px-Oceanus_Mosaic_from_Antioch.jpg"],
  "hip": ["img/hip.png", "img/hip.jpg", "img/hip.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Ilion---metopa.jpg/330px-Ilion---metopa.jpg"],
  "jap": ["img/jap.png", "img/jap.jpg", "img/jap.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Prometheus_and_Atlas%2C_Laconian_black-figure_kylix%2C_by_the_Arkesilas_Painter%2C_560-550_BC%2C_inv._16592_-_Museo_Gregoriano_Etrusco_-_Vatican_Museums_-_DSC01069.jpg/330px-Prometheus_and_Atlas%2C_Laconian_black-figure_kylix%2C_by_the_Arkesilas_Painter%2C_560-550_BC%2C_inv._16592_-_Museo_Gregoriano_Etrusco_-_Vatican_Museums_-_DSC01069.jpg"],
  "atl": ["img/atl.png", "img/atl.jpg", "img/atl.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/MAN_Atlante_fronte_1040572.JPG/330px-MAN_Atlante_fronte_1040572.JPG"],
  "cri": ["img/cri.png", "img/cri.jpg", "img/cri.webp", "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/Jason_Pelias_Louvre_K127.jpg/330px-Jason_Pelias_Louvre_K127.jpg"]
  };
})();
