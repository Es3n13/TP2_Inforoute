import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { 
  fetchDatasets, 
  setSearchFilter, 
  setFilters,
  setPage,
  Dataset,
  Resource
} from '../features/data/dataSlice';
import Layout from '../components/Layout';
import { Search, Filter, Calendar, Building, Tag, Eye, ChevronLeft, ChevronRight, FileText, LibraryBig } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

const DatasetList: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    list: datasets,
    pagination,
    filters,
    loading,
    error
  } = useAppSelector((state) => state.data.datasets);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [ordering, setOrdering] = useState('');

  // Charger les datasets
  useEffect(() => {
    dispatch(fetchDatasets({ page: 1 }));
  }, [dispatch]);

  // Recherche
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setSearchFilter(searchTerm));
      dispatch(fetchDatasets({ 
        page: 1, 
        search: searchTerm,
        filters 
      }));
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, dispatch]);

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
    dispatch(fetchDatasets({ page, search: searchTerm, filters }));
  };

  const handleOrderingChange = (order: string) => {
    setOrdering(order);
    dispatch(fetchDatasets({ 
      page: 1, 
      search: searchTerm,
      filters 
    }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    dispatch(setSearchFilter(''));
    dispatch(fetchDatasets({ page: 1 }));
  };

  if (loading && datasets.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center mb-8">
          <div className="p-3 bg-blue-100 rounded-lg mr-4">
            <LibraryBig className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Jeux de données - Québec Données
            </h1>
            <p className="text-gray-600 mt-2">
              Explorez les jeux de données ouverts du gouvernement du Québec
            </p>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Champ de recherche */}
                <div className="md:col-span-8">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher par titre, description, tags ou organisation..."
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Tri */}
                <div className="md:col-span-3">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={ordering}
                      onChange={(e) => handleOrderingChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Trier par...</option>
                      <option value="title">Titre (A-Z)</option>
                      <option value="-title">Titre (Z-A)</option>
                      <option value="-metadata_modified">Plus récents</option>
                      <option value="metadata_modified">Plus anciens</option>
                    </select>
                  </div>
                </div>

                {/* Bouton rechercher */}
                <div className="md:col-span-1">
                  <button
                    type="submit"
                    className="w-full h-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Compteur de résultats */}
            <div className="mt-4">
              <p className="text-gray-600">
                {searchTerm ? (
                  <>
                    <strong>{datasets.length}</strong> résultat(s) trouvé(s) pour "
                    <strong>{searchTerm}</strong>"
                  </>
                ) : (
                  <>
                    <strong>{pagination.totalItems}</strong> jeu(x) de données disponible(s)
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Grille des datasets */}
        {datasets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aucun jeu de données trouvé
              </h3>
              <p className="text-gray-500">
                Aucun jeu de données ne correspond à votre recherche.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets.map((dataset: Dataset) => (
                <Card 
                  key={dataset.ckan_id} 
                  className="h-full flex flex-col border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      <FileText className="inline-block h-5 w-5 text-blue-600 mr-2" />
                      {dataset.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    {/* Description */}
                    {dataset.notes && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {dataset.notes}
                      </p>
                    )}

                    {/* Organisation */}
                    <div className="flex items-center mb-3">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">
                        {dataset.organization_title || 'Organisation inconnue'}
                      </span>
                    </div>

                    {/* Date de modification */}
                    <div className="flex items-center mb-3">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {dataset.metadata_modified 
                          ? new Date(dataset.metadata_modified).toLocaleDateString('fr-CA')
                          : 'Non disponible'}
                      </span>
                    </div>

                    {/* Tags */}
                    {dataset.tags && dataset.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Tag className="h-4 w-4 text-blue-400 mr-2" />
                          <span className="text-sm text-gray-600">Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dataset.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {dataset.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                              +{dataset.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-gray-100">
                    <a
                      href={`/datasets/${dataset.ckan_id}`}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Détails
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-2 rounded-lg flex items-center ${
                    pagination.currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          pageNum === pagination.currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-2 rounded-lg flex items-center ${
                    pagination.currentPage === pagination.totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default DatasetList;