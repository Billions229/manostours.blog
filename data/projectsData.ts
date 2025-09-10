type Project = {
  title: string
  description: string
  imgSrc: string
  href: string
}

type ProjectsData = {
  [locale: string]: Project[]
}

const projectsData: ProjectsData = {
  en: [
    {
      title: 'Benin Cultural Heritage Tour',
      description: `Discover the rich history of the ancient Dahomey Kingdom, explore the Royal Palaces of Abomey,
        walk the Slave Route in Ouidah, and experience authentic Vodoun ceremonies. A journey through time
        in the cradle of West African civilization.`,
      imgSrc: '/static/images/benin-tour.jpg',
      href: '/en/blog/discover-benin-authentic-africa',
    },
    {
      title: 'Togo Adventure & Culture',
      description: `Experience the diversity of Togo from Atlantic beaches to Sahel savannas. Visit UNESCO-listed
        Tamberma fortresses, explore vibrant markets, and discover the legacy of the famous Nana Benz.
        An authentic West African adventure.`,
      imgSrc: '/static/images/togo-tour.jpg',
      href: '/en/blog/togo-mosaic-treasures-west-africa',
    },
    {
      title: 'Ghana Golden Experience',
      description: `Explore Ghana's golden heritage from Ashanti kingdoms to modern democracy. Visit historic
        Cape Coast Castle, experience vibrant festivals, spot wildlife in Mole National Park, and enjoy
        the warmth of Ghanaian hospitality.`,
      imgSrc: '/static/images/ghana-tour.jpg',
      href: '/en/blog/ghana-golden-gateway-west-africa',
    },
  ],

  fr: [
    {
      title: 'Circuit Patrimoine Culturel du Bénin',
      description: `Découvrez la riche histoire de l'ancien royaume du Dahomey, explorez les Palais Royaux d'Abomey,
        parcourez la Route des Esclaves à Ouidah, et vivez des cérémonies Vodoun authentiques. Un voyage dans le temps
        au berceau de la civilisation ouest-africaine.`,
      imgSrc: '/static/images/benin-tour.jpg',
      href: '/fr/blog/decouvrir-benin-afrique-authentique',
    },
    {
      title: 'Aventure & Culture au Togo',
      description: `Vivez la diversité du Togo des plages atlantiques aux savanes sahéliennes. Visitez les forteresses
        Tamberma classées UNESCO, explorez les marchés vibrants, et découvrez l'héritage des célèbres Nana Benz.
        Une aventure ouest-africaine authentique.`,
      imgSrc: '/static/images/togo-tour.jpg',
      href: '/fr/blog/togo-mosaique-tresors-afrique-ouest',
    },
    {
      title: 'Expérience Dorée du Ghana',
      description: `Explorez l'héritage doré du Ghana des royaumes Ashanti à la démocratie moderne. Visitez l'historique
        Château de Cape Coast, vivez des festivals vibrants, observez la faune au Parc National Mole, et profitez
        de la chaleur de l'hospitalité ghanéenne.`,
      imgSrc: '/static/images/ghana-tour.jpg',
      href: '/fr/blog/ghana-porte-doree-afrique-ouest',
    },
  ],
}

export default projectsData
