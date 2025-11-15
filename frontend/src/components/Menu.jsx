// ============================================
// COMPOSANT MENU - NAVIGATION ENTRE LES OUTILS
// ============================================
// Ce composant affiche un menu horizontal permettant de naviguer entre les différents outils
// Il reçoit des "props" (propriétés) depuis le composant parent (App)

import './Menu.css';

/**
 * Menu - Composant de navigation
 * 
 * @param {Object} props - Les propriétés passées depuis le composant parent
 * @param {string} props.outilActif - Le nom de l'outil actuellement affiché
 * @param {Function} props.changerOutil - Fonction pour changer d'outil
 * 
 * En React, les props sont en lecture seule (immutables)
 * On ne peut pas modifier directement props.outilActif depuis ce composant
 * On doit utiliser la fonction props.changerOutil() pour demander au parent de changer
 */
function Menu({ outilActif, changerOutil }) {
  // Liste des outils disponibles
  // On pourra ajouter d'autres outils ici plus tard
  const outils = [
    { id: 'alibalek', nom: 'Alibalek', description: 'Générateur de schémas électriques' }
    // Exemple pour ajouter un autre outil :
    // { id: 'autre-outil', nom: 'Autre Outil', description: 'Description...' }
  ];

  /**
   * Gestionnaire d'événement pour le clic sur un onglet
   * Cette fonction est appelée quand l'utilisateur clique sur un onglet du menu
   * 
   * @param {string} idOutil - L'identifiant de l'outil sélectionné
   */
  const gererClic = (idOutil) => {
    // On appelle la fonction changerOutil passée en prop
    // Cette fonction va mettre à jour l'état dans le composant App
    // Ce qui déclenchera un re-render et affichera le bon outil
    changerOutil(idOutil);
  };

  // Le JSX retourné décrit la structure HTML du menu
  return (
    <nav className="menu">
      <div className="menu-header">
        <h1>HTTP Tools</h1>
      </div>
      
      <ul className="menu-onglets">
        {/* 
          .map() parcourt le tableau outils et crée un élément <li> pour chaque outil
          La clé (key) est importante en React : elle permet à React d'identifier
          chaque élément de la liste pour optimiser les re-renders
        */}
        {outils.map((outil) => (
          <li key={outil.id}>
            {/* 
              Le bouton a une classe conditionnelle :
              - Si outil.id === outilActif, on ajoute la classe "actif" pour le style
              - onClick appelle gererClic avec l'id de l'outil
            */}
            <button
              className={outil.id === outilActif ? 'onglet actif' : 'onglet'}
              onClick={() => gererClic(outil.id)}
            >
              {outil.nom}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Menu;

