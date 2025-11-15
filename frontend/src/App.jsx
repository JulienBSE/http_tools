// ============================================
// COMPOSANT PRINCIPAL DE L'APPLICATION
// ============================================
// Ce composant App est le point d'entrée de notre application React
// Il gère la navigation entre les différents outils via un menu

import { useState } from 'react';
import './App.css';
import Menu from './components/Menu';
import Alibalek from './pages/Alibalek';

/**
 * App - Composant racine de l'application
 * 
 * Ce composant utilise le hook useState pour gérer l'état de l'application.
 * useState est un hook React qui permet de stocker des données qui peuvent changer
 * et qui déclenchent un re-render du composant quand elles changent.
 * 
 * Syntaxe : const [valeur, setValeur] = useState(valeurInitiale)
 * - valeur : la valeur actuelle de l'état
 * - setValeur : fonction pour modifier cette valeur
 * - valeurInitiale : la valeur au premier rendu
 */
function App() {
  // État pour savoir quel outil est actuellement affiché
  // 'alibalek' est l'outil par défaut (générateur de schéma)
  // Quand on changera d'outil, on mettra à jour cet état
  const [outilActif, setOutilActif] = useState('alibalek');

  /**
   * Fonction pour changer d'outil
   * Cette fonction sera passée au composant Menu pour qu'il puisse changer l'outil actif
   * 
   * @param {string} nomOutil - Le nom de l'outil à afficher
   */
  const changerOutil = (nomOutil) => {
    // setOutilActif met à jour l'état, ce qui déclenche un re-render
    // React va alors afficher le bon composant selon la valeur de outilActif
    setOutilActif(nomOutil);
  };

  /**
   * Fonction pour déterminer quel composant afficher selon l'outil actif
   * On utilise un switch pour gérer plusieurs outils à l'avenir
   */
  const afficherOutil = () => {
    switch (outilActif) {
      case 'alibalek':
        return <Alibalek />;
      // Ici on pourra ajouter d'autres outils plus tard
      // case 'autre-outil':
      //   return <AutreOutil />;
      default:
        return <Alibalek />;
    }
  };

  // Le return contient le JSX (JavaScript XML) qui décrit l'interface
  // React va transformer ce JSX en éléments DOM réels
  return (
    <div className="app">
      {/* 
        Le composant Menu reçoit deux props (propriétés) :
        - outilActif : pour savoir quel onglet est actif (affichage visuel)
        - changerOutil : fonction callback pour changer d'outil quand on clique
      */}
      <Menu outilActif={outilActif} changerOutil={changerOutil} />
      
      {/* 
        Zone principale où s'affiche l'outil sélectionné
        On appelle la fonction afficherOutil() qui retourne le bon composant
      */}
      <main className="contenu-principal">
        {afficherOutil()}
      </main>
    </div>
  );
}

export default App;
