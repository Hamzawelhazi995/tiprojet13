"use strict";

/* ==========================================================
   EcoTunisie · script.js
   Un seul fichier pour les 4 pages : chaque module ne s'active
   que si les éléments de la page courante existent.
   Les données sont écrites dans le code (remises à zéro au rechargement).
   ========================================================== */

// Préfixe des chemins : "" sur l'accueil, "../" dans le dossier pages/
const RACINE = document.body.getAttribute("data-racine") || "";

/* ----------------------------------------------------------
   Outil commun : afficher un message dans une zone
   (textContent uniquement : jamais innerHTML pour du texte saisi)
   ---------------------------------------------------------- */
function afficherMessage(zone, texte, type) {
  zone.textContent = texte;
  zone.classList.remove("cachee", "succes", "erreur");
  zone.classList.add(type);
}

function masquerMessage(zone) {
  zone.textContent = "";
  zone.classList.add("cachee");
  zone.classList.remove("succes", "erreur");
}

/* ==========================================================
   Module E : thème sombre (4 pages)
   ========================================================== */
function initialiserTheme() {
  const boutonTheme = document.getElementById("btn-theme");

  if (boutonTheme) {
    boutonTheme.addEventListener("click", function () {
      document.body.classList.toggle("sombre");
    });
  }
}

/* ==========================================================
   Module A : catalogue dynamique
   ========================================================== */
const gestes = [
  { nom: "Prendre des douches courtes", domaine: "Eau", difficulte: "Facile", economieCO2: 4,
    description: "Réduire la douche à 5 minutes économise de l'eau chaude et de l'énergie.", image: "douche.svg" },
  { nom: "Réparer les fuites", domaine: "Eau", difficulte: "Moyen", economieCO2: 5,
    description: "Un robinet qui goutte gaspille des centaines de litres par mois.", image: "robinet.svg" },
  { nom: "Éteindre les appareils en veille", domaine: "Énergie", difficulte: "Facile", economieCO2: 6,
    description: "Télévision, chargeurs, box : débranchez ce qui ne sert pas.", image: "veille.svg" },
  { nom: "Passer aux ampoules LED", domaine: "Énergie", difficulte: "Facile", economieCO2: 8,
    description: "Les LED consomment beaucoup moins et durent bien plus longtemps.", image: "ampoule.svg" },
  { nom: "Trier ses déchets", domaine: "Déchets", difficulte: "Moyen", economieCO2: 12,
    description: "Papier, plastique, verre : séparer les déchets permet de les recycler.", image: "tri.svg" },
  { nom: "Composter les déchets de cuisine", domaine: "Déchets", difficulte: "Engagé", economieCO2: 9,
    description: "Épluchures et restes deviennent un engrais naturel pour les plantes.", image: "compost.svg" },
  { nom: "Utiliser le vélo pour les trajets courts", domaine: "Transport", difficulte: "Engagé", economieCO2: 15,
    description: "Pour moins de 5 km, le vélo est souvent aussi rapide que la voiture.", image: "velo.svg" },
  { nom: "Prendre le bus plutôt que la voiture", domaine: "Transport", difficulte: "Moyen", economieCO2: 11,
    description: "Un bus bien rempli émet beaucoup moins de CO₂ par passager.", image: "bus.svg" }
];

// Domaine sélectionné par les boutons de filtre
let domaineActif = "Tous";

/* Construit une carte d'éco-geste (article.carte) */
function creerCarte(geste, indice) {
  const carte = document.createElement("article");
  carte.className = "carte";
  carte.setAttribute("data-indice", indice);

  const image = document.createElement("img");
  image.src = RACINE + "images/" + geste.image;
  image.alt = "Illustration : " + geste.nom;

  const titre = document.createElement("h3");
  titre.textContent = geste.nom;

  const description = document.createElement("p");
  description.textContent = geste.description;

  const economie = document.createElement("p");
  economie.className = "economie";
  economie.textContent = "Économie : " + geste.economieCO2 + " kg CO₂/mois";

  // Badge de difficulté : classe différente selon le niveau
  const badge = document.createElement("span");
  let classeBadge;
  switch (geste.difficulte) {
    case "Facile":
      classeBadge = "badge-facile";
      break;
    case "Moyen":
      classeBadge = "badge-moyen";
      break;
    default:
      classeBadge = "badge-engage";
  }
  badge.className = "badge " + classeBadge;
  badge.textContent = geste.difficulte;

  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "btn btn-defi";
  bouton.textContent = "Relever ce défi";
  bouton.setAttribute("data-indice", indice);

  carte.append(image, badge, titre, description, economie, bouton);
  return carte;
}

/* Ajoute toutes les cartes dans #catalogue */
function afficherCatalogue(conteneur) {
  gestes.forEach(function (geste, indice) {
    conteneur.appendChild(creerCarte(geste, indice));
  });
}

/* Applique recherche ET filtre de domaine, puis met à jour le compteur */
function appliquerFiltres() {
  const conteneur = document.getElementById("catalogue");
  const texte = document.getElementById("recherche").value.trim().toLowerCase();
  const compteur = document.getElementById("compteur");
  const messageVide = document.getElementById("aucun-resultat");
  let visibles = 0;

  conteneur.querySelectorAll(".carte").forEach(function (carte) {
    const geste = gestes[Number(carte.getAttribute("data-indice"))];
    const correspondTexte = geste.nom.toLowerCase().includes(texte);
    const correspondDomaine = domaineActif === "Tous" || geste.domaine === domaineActif;
    const visible = correspondTexte && correspondDomaine;

    carte.classList.toggle("cachee", !visible);
    if (visible) {
      visibles++;
    }
  });

  compteur.textContent = visibles + " éco-geste(s) affiché(s)";
  messageVide.classList.toggle("cachee", visibles !== 0);
}

function initialiserCatalogue() {
  const conteneur = document.getElementById("catalogue");
  if (!conteneur) {
    return;
  }

  afficherCatalogue(conteneur);

  // Recherche en direct
  document.getElementById("recherche").addEventListener("input", appliquerFiltres);

  // Filtres par domaine (délégation sur le conteneur des boutons)
  const zoneFiltres = document.getElementById("filtres");
  zoneFiltres.addEventListener("click", function (evenement) {
    const bouton = evenement.target.closest(".btn-filtre");
    if (!bouton) {
      return;
    }
    domaineActif = bouton.getAttribute("data-domaine");
    zoneFiltres.querySelectorAll(".btn-filtre").forEach(function (b) {
      const actif = b === bouton;
      b.classList.toggle("actif", actif);
      b.setAttribute("aria-pressed", String(actif));
    });
    appliquerFiltres();
  });

  appliquerFiltres();
}

/* ==========================================================
   Module B : Mon défi de la semaine
   ========================================================== */
const defi = [];            // objets { nom, economieCO2, realise }
const MAX_GESTES_DEFI = 6;

/* Ajoute un geste au défi avec contrôles (doublon, maximum) */
function ajouterAuDefi(indice) {
  const zoneMessage = document.getElementById("message-defi");
  const geste = gestes[indice];

  // Refus d'un geste déjà présent
  for (let i = 0; i < defi.length; i++) {
    if (defi[i].nom === geste.nom) {
      afficherMessage(zoneMessage, "Ce geste est déjà dans votre défi.", "erreur");
      return;
    }
  }

  // Refus d'un 7e geste
  if (defi.length >= MAX_GESTES_DEFI) {
    afficherMessage(zoneMessage, "Votre défi est complet : 6 gestes maximum.", "erreur");
    return;
  }

  defi.push({ nom: geste.nom, economieCO2: geste.economieCO2, realise: false });
  afficherMessage(zoneMessage, "« " + geste.nom + " » ajouté à votre défi.", "succes");
  afficherDefi();
}

/* Pourcentage de gestes réalisés (0 si le tableau est vide) */
function calculerProgression(tab) {
  if (tab.length === 0) {
    return 0;
  }
  const realises = tab.filter(function (geste) { return geste.realise; }).length;
  return Math.round((realises / tab.length) * 100);
}

/* Niveau selon l'économie totale de CO₂ (kg) */
function determinerNiveau(totalKg) {
  if (totalKg < 10) {
    return "Éco-débutant";
  } else if (totalKg <= 30) {
    return "Éco-engagé";
  } else {
    return "Éco-champion";
  }
}

/* Met à jour barre, texte, total et niveau */
function mettreAJourBilan() {
  const pourcentage = calculerProgression(defi);
  const barre = document.getElementById("barre");
  document.getElementById("barre-remplie").style.width = pourcentage + "%";
  barre.setAttribute("aria-valuenow", pourcentage);
  document.getElementById("texte-progression").textContent = pourcentage + " % réalisé";

  let total = 0;
  defi.forEach(function (geste) {
    if (geste.realise) {
      total += geste.economieCO2;
    }
  });
  document.getElementById("total-co2").textContent = total.toFixed(1);
  document.getElementById("niveau").textContent = determinerNiveau(total);
}

/* Recrée entièrement la liste #liste-defi */
function afficherDefi() {
  const liste = document.getElementById("liste-defi");
  liste.textContent = "";

  defi.forEach(function (geste, indice) {
    const li = document.createElement("li");

    const etiquette = document.createElement("label");
    const caseACocher = document.createElement("input");
    caseACocher.type = "checkbox";
    caseACocher.checked = geste.realise;
    caseACocher.setAttribute("data-indice", indice);
    etiquette.append(caseACocher, " Réalisé");

    const nom = document.createElement("span");
    nom.className = "nom-geste";
    nom.textContent = geste.nom;

    const retirer = document.createElement("button");
    retirer.type = "button";
    retirer.className = "btn-retirer";
    retirer.textContent = "Retirer";
    retirer.setAttribute("data-indice", indice);

    li.append(etiquette, nom, retirer);
    liste.appendChild(li);
  });

  document.getElementById("defi-vide").classList.toggle("cachee", defi.length !== 0);
  mettreAJourBilan();
}

function initialiserDefi() {
  const conteneur = document.getElementById("catalogue");
  const liste = document.getElementById("liste-defi");
  if (!conteneur || !liste) {
    return;
  }

  // Un seul écouteur sur #catalogue (délégation avec closest)
  conteneur.addEventListener("click", function (evenement) {
    const bouton = evenement.target.closest(".btn-defi");
    if (bouton) {
      ajouterAuDefi(Number(bouton.getAttribute("data-indice")));
    }
  });

  // Délégation sur la liste : case à cocher (change) et bouton Retirer (click)
  liste.addEventListener("change", function (evenement) {
    const caseACocher = evenement.target;
    if (caseACocher.matches("input[type='checkbox']")) {
      const indice = Number(caseACocher.getAttribute("data-indice"));
      defi[indice].realise = caseACocher.checked;
      afficherDefi();
    }
  });

  liste.addEventListener("click", function (evenement) {
    const bouton = evenement.target.closest(".btn-retirer");
    if (bouton) {
      const indice = Number(bouton.getAttribute("data-indice"));
      defi.splice(indice, 1);
      afficherDefi();
    }
  });

  afficherDefi();
}

/* ==========================================================
   Module C : calculateur d'empreinte carbone
   ========================================================== */
const COEF_VOITURE = 0.19;     // kg CO₂ par km
const COEF_ELECTRICITE = 0.5;  // kg CO₂ par kWh
const REDUCTION_TRI = 15;      // kg CO₂ retirés par mois si tri sélectif

/* Empreinte mensuelle en kg de CO₂ (jamais négative) */
function calculerEmpreinte(km, kwh, alimentation, tri = false) {
  // km par semaine × 4 semaines × coefficient voiture
  const empreinte = km * 4 * COEF_VOITURE + kwh * COEF_ELECTRICITE + alimentation - (tri ? REDUCTION_TRI : 0);
  return Math.max(0, empreinte);
}

/* Convertit une saisie en nombre ; NaN si le champ est vide */
function lireNombre(champ) {
  const texte = champ.value.trim();
  return texte === "" ? NaN : Number(texte);
}

function initialiserEmpreinte() {
  const formulaire = document.getElementById("form-empreinte");
  if (!formulaire) {
    return;
  }

  const champKm = document.getElementById("km");
  const curseur = document.getElementById("kwh");
  const valeurCurseur = document.getElementById("kwh-valeur");
  const choixAlimentation = document.getElementById("alimentation");
  const caseTri = document.getElementById("tri");
  const zoneErreur = document.getElementById("erreur-empreinte");
  const zoneResultat = document.getElementById("resultat");

  // Valeur du curseur affichée en direct
  curseur.addEventListener("input", function () {
    valeurCurseur.textContent = curseur.value;
  });

  formulaire.addEventListener("submit", function (evenement) {
    evenement.preventDefault();

    const km = lireNombre(champKm);
    const kwh = lireNombre(curseur);
    const alimentation = lireNombre(choixAlimentation);

    // Contrôle des saisies : rien n'est calculé si une valeur est invalide
    if (Number.isNaN(km) || km < 0 || km > 2000) {
      afficherMessage(zoneErreur, "Les kilomètres doivent être un nombre entre 0 et 2000.", "erreur");
      zoneResultat.classList.add("cachee");
      return;
    }
    if (Number.isNaN(kwh) || kwh < 0 || kwh > 500) {
      afficherMessage(zoneErreur, "La consommation d'électricité doit être entre 0 et 500 kWh.", "erreur");
      zoneResultat.classList.add("cachee");
      return;
    }
    if (Number.isNaN(alimentation)) {
      afficherMessage(zoneErreur, "Veuillez choisir un type d'alimentation.", "erreur");
      zoneResultat.classList.add("cachee");
      return;
    }

    masquerMessage(zoneErreur);
    const empreinte = calculerEmpreinte(km, kwh, alimentation, caseTri.checked);
    afficherResultatEmpreinte(empreinte);
  });
}

/* Affiche valeur, catégorie colorée et conseil adapté */
function afficherResultatEmpreinte(empreinte) {
  const zoneCategorie = document.getElementById("resultat-categorie");
  let categorie;
  let classe;
  let conseil;

  if (empreinte < 150) {
    categorie = "Empreinte faible";
    classe = "categorie-faible";
    conseil = "Bravo ! Continuez ainsi et partagez vos habitudes autour de vous.";
  } else if (empreinte <= 300) {
    categorie = "Empreinte moyenne";
    classe = "categorie-moyenne";
    conseil = "Vous êtes sur la bonne voie : essayez le vélo ou le bus pour vos trajets courts.";
  } else {
    categorie = "Empreinte élevée";
    classe = "categorie-elevee";
    conseil = "Réduisez la voiture, éteignez les appareils en veille et triez vos déchets.";
  }

  document.getElementById("resultat-valeur").textContent = empreinte.toFixed(1);
  zoneCategorie.textContent = categorie;
  zoneCategorie.className = "resultat-categorie " + classe;
  document.getElementById("resultat-conseil").textContent = conseil;
  document.getElementById("resultat").classList.remove("cachee");
}

/* ==========================================================
   Module D : formulaire « Rejoindre l'initiative »
   Chaque fonction renvoie un message d'erreur ou "".
   ========================================================== */
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_TELEPHONE = /^\d{8}$/;

// R1
function validerNom(valeur) {
  return valeur.length >= 3 ? "" : "Le nom doit contenir au moins 3 caractères.";
}

// R2
function validerEmail(valeur) {
  if (valeur === "") {
    return "L'e-mail est obligatoire.";
  }
  return REGEX_EMAIL.test(valeur) ? "" : "L'adresse e-mail n'est pas valide.";
}

// R3
function validerTelephone(valeur) {
  return REGEX_TELEPHONE.test(valeur) ? "" : "Le téléphone doit contenir exactement 8 chiffres.";
}

// R4
function validerAge(valeur) {
  if (valeur === "") {
    return "L'âge est obligatoire.";
  }
  const age = Number(valeur);
  if (!Number.isInteger(age) || age < 16 || age > 60) {
    return "L'âge doit être un nombre entier entre 16 et 60.";
  }
  return "";
}

// R5 (première partie : domaine)
function validerDomaine(valeur) {
  return valeur !== "" ? "" : "Veuillez choisir un domaine.";
}

// R5 (seconde partie : disponibilité)
function validerDisponibilite(valeur) {
  return valeur !== "" ? "" : "Veuillez choisir une disponibilité.";
}

// R6
function validerMotivation(valeur) {
  return valeur.length >= 20 ? "" : "La motivation doit contenir au moins 20 caractères.";
}

// R7
function validerConditions(acceptees) {
  return acceptees ? "" : "Vous devez accepter les conditions.";
}

/* Écrit le message dans le span d'erreur et marque le champ invalide */
function afficherErreur(idChamp, message) {
  document.getElementById("erreur-" + idChamp).textContent = message;
  document.getElementById(idChamp).classList.toggle("invalide", message !== "");
}

/* Lit les valeurs du formulaire (trim() pour les textes, checked pour les cases) */
function lireFormulaire() {
  const radioCoche = document.querySelector("input[name='dispo']:checked");
  return {
    nom: document.getElementById("nom").value.trim(),
    email: document.getElementById("email").value.trim(),
    telephone: document.getElementById("telephone").value.trim(),
    age: document.getElementById("age").value.trim(),
    domaine: document.getElementById("domaine").value,
    dispo: radioCoche ? radioCoche.value : "",
    motivation: document.getElementById("motivation").value.trim(),
    conditions: document.getElementById("conditions").checked
  };
}

/* Valide tous les champs, affiche toutes les erreurs et renvoie true si tout est correct */
function validerFormulaire() {
  const v = lireFormulaire();
  const erreurs = {
    nom: validerNom(v.nom),
    email: validerEmail(v.email),
    telephone: validerTelephone(v.telephone),
    age: validerAge(v.age),
    domaine: validerDomaine(v.domaine),
    dispo: validerDisponibilite(v.dispo),
    motivation: validerMotivation(v.motivation),
    conditions: validerConditions(v.conditions)
  };

  let toutEstValide = true;
  for (const idChamp in erreurs) {
    afficherErreur(idChamp, erreurs[idChamp]);
    if (erreurs[idChamp] !== "") {
      toutEstValide = false;
    }
  }
  return toutEstValide;
}

function initialiserFormulaire() {
  const formulaire = document.getElementById("form-rejoindre");
  if (!formulaire) {
    return;
  }
  const zoneMessage = document.getElementById("message-form");

  formulaire.addEventListener("submit", function (evenement) {
    evenement.preventDefault();

    if (validerFormulaire()) {
      const nom = lireFormulaire().nom;
      // textContent : le nom saisi n'est jamais interprété comme du HTML
      afficherMessage(zoneMessage, `Merci ${nom}, votre demande est enregistrée.`, "succes");
      formulaire.reset();
    } else {
      masquerMessage(zoneMessage);
    }
  });

  // Après un reset manuel, on efface toutes les erreurs
  formulaire.addEventListener("reset", function () {
    ["nom", "email", "telephone", "age", "domaine", "dispo", "motivation", "conditions"].forEach(function (idChamp) {
      afficherErreur(idChamp, "");
    });
  });
}

/* ==========================================================
   Démarrage (le script est chargé avec defer : le DOM est prêt)
   ========================================================== */
initialiserTheme();
initialiserCatalogue();
initialiserDefi();
initialiserEmpreinte();
initialiserFormulaire();
