import React, { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchDatasets } from '../features/data/dataSlice';
import Layout from '../components/Layout';
import { Database, BarChart3, Users, Download, ChevronRight, Calendar, Building, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function Home() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Récupérer les données depuis Redux
  const { 
    list: datasets, 
    pagination, 
    loading: datasetsLoading,
    error: datasetsError 
  } = useAppSelector((state) => state.data.datasets);

  // Calculer les statistiques en temps réel
  const statistics = useMemo(() => {
    if (!datasets || datasets.length === 0) {
      return {
        total_datasets: 0,
        organizations_count: 0,
        total_resources: 0,
      };
    }
    
    const uniqueOrganizations = new Set<string>();
    let totalResources = 0;
    
    datasets.forEach((dataset) => {
      // Organisation unique
      if (dataset.organization_title && dataset.organization_title.trim() !== '') {
        uniqueOrganizations.add(dataset.organization_title);
      }
      
      // Total des ressources
      if (dataset.resources && Array.isArray(dataset.resources)) {
        totalResources += dataset.resources.length;
      }
    });
    
    return {
      total_datasets: pagination.totalItems || datasets.length,
      organizations_count: uniqueOrganizations.size,
      total_resources: totalResources,
    };
  }, [datasets, pagination.totalItems]);

  // Charger les datasets au montage
  useEffect(() => {
    if (datasets.length === 0) {
      dispatch(fetchDatasets({ page: 1}));
    }
  }, [dispatch, datasets.length]);

  // Fonctions de navigation
  const navigateToDatasets = () => navigate('/datasets');
  const navigateToStats = () => navigate('/stats');

  // Gestion des erreurs
  if (datasetsError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Database className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Erreur de chargement
            </h2>
            <p className="text-gray-600 mb-6">{datasetsError}</p>
            <button
              onClick={() => dispatch(fetchDatasets({ page: 1 }))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isLoading = datasetsLoading && datasets.length === 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Message en-tête */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-[#003366] mb-4">
            <Database className="inline-block mr-3 h-10 w-10" />
            Portail vers Données Québec
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Accédez aux jeux de données ouverts du gouvernement du Québec.
            Explorez, téléchargez et analysez les données publiques.
          </p>
        </div>

        {/* Carte des statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Jeux de données */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Database className="mr-2 h-5 w-5 text-blue-600" />
                Jeux de données
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-500">Chargement...</span>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-[#003366]">
                    {statistics.total_datasets.toLocaleString()}
                  </p>
                  <p className="text-gray-500">Disponibles</p>
                  <div className="mt-2 text-xs text-gray-400">
                    {datasets.length} chargés sur {statistics.total_datasets}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Organisations */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5 text-purple-600" />
                Organisations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  <span className="ml-3 text-gray-500">Chargement...</span>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-[#003366]">
                    {statistics.organizations_count}
                  </p>
                  <p className="text-gray-500">Participantes</p>
                  <div className="mt-2 text-xs text-gray-400">
                    Basé sur {datasets.length} jeux de données
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Ressources */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Download className="mr-2 h-5 w-5 text-green-600" />
                Ressources
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  <span className="ml-3 text-gray-500">Chargement...</span>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-[#003366]">
                    {statistics.total_resources}
                  </p>
                  <p className="text-gray-500">Téléchargeables</p>
                  <div className="mt-2 text-xs text-gray-400">
                    Moyenne: {(statistics.total_resources / Math.max(datasets.length, 1)).toFixed(1)} par jeu
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Liens rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Tableau de bord statistique */}
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-0 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <BarChart3 className="h-12 w-12 text-blue-600 mr-4 flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Tableau de bord statistique
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Visualisez les tendances et analyses des données
                  </p>
                  <button 
                    onClick={navigateToStats}
                    className="group flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                  >
                    <span>Accéder aux statistiques</span>
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Catalogue des données */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <Database className="h-12 w-12 text-green-600 mr-4 flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Catalogue des données
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Explorez l'ensemble des {statistics.total_datasets.toLocaleString()} jeux de données disponibles
                  </p>
                  <button 
                    onClick={navigateToDatasets}
                    className="group flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                  >
                    <span>Parcourir le catalogue</span>
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section de datasets récents */}
        {datasets.length > 0 && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Database className="mr-3 h-6 w-6" />
                Jeux de données récents
              </h2>
              <Link 
                to="/datasets"
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                Voir tout ({statistics.total_datasets})
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets.slice(0, 6).map((dataset) => (
                <Card 
                  key={dataset.ckan_id}
                  className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                  onClick={() => navigate(`/datasets/${dataset.ckan_id}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {dataset.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Organisation */}
                    {dataset.organization_title && (
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Building className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{dataset.organization_title}</span>
                      </div>
                    )}
                    
                    {/* Date de modification */}
                    {dataset.metadata_modified && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span>
                          {new Date(dataset.metadata_modified).toLocaleDateString('fr-CA')}
                        </span>
                      </div>
                    )}
                    
                    {/* Tags */}
                    {dataset.tags && dataset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {dataset.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {dataset.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                            +{dataset.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Ressources disponibles */}
                    {dataset.resources && dataset.resources.length > 0 && (
                      <div className="mt-3 text-xs text-gray-500 flex items-center">
                        <Download className="h-3 w-3 mr-1" />
                        {dataset.resources.length} ressource{dataset.resources.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chargement initial */}
        {isLoading && datasets.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        )}
      </div>
    </Layout>
  );
}