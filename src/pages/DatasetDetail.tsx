import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchDatasetDetail, Dataset, Resource } from '../features/data/dataSlice';
import Layout from '../components/Layout';
import {
  ArrowLeft,
  Building,
  Calendar,
  Tag,
  Users,
  Shield,
  FileText,
  Download,
  Globe,
  Lock,
  Eye,
  Clock,
  RefreshCw,
  Info,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const DatasetDetail: React.FC = () => {
  const { ckanId } = useParams<{ ckanId: string }>();
  const dispatch = useAppDispatch();
  const { currentDataset, loading, error } = useAppSelector(
    (state) => state.data.datasets
  );

  useEffect(() => {
    if (ckanId) {
      dispatch(fetchDatasetDetail(ckanId));
    }
  }, [ckanId, dispatch]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <Info className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-red-700 mb-2">
                  Erreur de chargement
                </h3>
                <p className="text-red-600">{error}</p>
                <Link
                  to="/datasets"
                  className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la liste
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!currentDataset) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-gray-400 mb-4">
                <Info className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Dataset non trouvé
              </h3>
              <p className="text-gray-500 mb-4">
                Le jeu de données demandé n'existe pas ou a été supprimé.
              </p>
              <Link
                to="/datasets"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste des datasets
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date non disponible';
    }
  };

  const handleDownload = (resource: Resource) => {
    window.open(resource.url, '_blank');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <div className="mb-6">
          <Link
            to="/datasets"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Link>
        </div>

        {/* En-tête */}
        <div className="flex items-start mb-8">
          <div className="p-3 bg-blue-100 rounded-lg mr-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentDataset.title}
            </h1>
            <div className="flex items-center text-gray-600">
              <Building className="h-4 w-4 mr-2" />
              <span>{currentDataset.organization_title}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  {currentDataset.notes.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contacts et responsables */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-cyan-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Contacts et responsables
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h6 className="text-blue-600 font-semibold mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Auteur
                    </h6>
                    <p className="text-gray-800 font-medium">
                      {currentDataset.author || 'Non spécifié'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classification */}
            {(currentDataset.tags.length > 0 || currentDataset.groups.length > 0) && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-amber-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Tags */}
                  {currentDataset.tags.length > 0 && (
                    <div>
                      <h6 className="text-gray-600 font-medium mb-3 flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Tags
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {currentDataset.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Groupes */}
                  {currentDataset.groups.length > 0 && (
                    <div>
                      <h6 className="text-gray-600 font-medium mb-3 flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Groupes
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {currentDataset.groups.map((group, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ressources disponibles */}
            {currentDataset.resources && currentDataset.resources.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-[#003366] text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Ressources disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {currentDataset.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <div className="flex items-start mb-2">
                              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {resource.name}
                                </h4>
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mt-1">
                                  {resource.format.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            {resource.description && (
                              <p className="text-gray-600 text-sm mb-3">
                                <Info className="inline-block h-3 w-3 mr-1" />
                                {resource.description}
                              </p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleDownload(resource)}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center whitespace-nowrap"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {resource.resource_type === 'donnees' ? 'Télécharger' : 'Ouvrir'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Organisation */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Organisation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <h6 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentDataset.organization_title || 'Non spécifiée'}
                </h6>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gray-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Création</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(currentDataset.metadata_created)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Dernière modification</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(currentDataset.metadata_modified)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Métadonnées */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gray-800 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Métadonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">État</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentDataset.state === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentDataset.state || 'Inconnu'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Privé</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentDataset.private
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {currentDataset.private ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Nom technique</p>
                  <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                    {currentDataset.name}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DatasetDetail;