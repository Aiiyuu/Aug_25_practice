/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const SORT_METHODS = ['ID', 'Product', 'Category', 'User'];

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    item => item.id === product.categoryId,
  );
  const user = usersFromServer.find(item => item.id === category.ownerId);

  return {
    ...product,
    category,
    user,
  };
});

function getSortedProducts(productList, sortMethod) {
  let sortedList = [...productList];

  switch (sortMethod) {
    case 'ID':
      sortedList = sortedList.sort((a, b) => a.id - b.id);
      break;

    case 'Product':
      sortedList = sortedList.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      break;

    case 'Category':
      sortedList = sortedList.sort((a, b) => {
        return a.category.title.localeCompare(b.category.title);
      });
      break;

    case 'User':
      sortedList = sortedList.sort((a, b) => {
        return a.user.name.localeCompare(b.user.name);
      });
      break;

    default:
      throw new Error('Invalid sort method');
  }

  return sortedList;
}

function getPreparedProducts(productsList, filters) {
  const {
    selectedUser = 'all',
    query,
    selectedCategories,
    selectedSortMethod,
    isReversed,
  } = filters;

  let preparedProducts = [...productsList];

  if (selectedUser && selectedUser !== 'all') {
    preparedProducts = preparedProducts.filter(
      product => product.user.id === selectedUser.id,
    );
  }

  if (query) {
    preparedProducts = preparedProducts.filter(item => {
      return item.name.toLowerCase().includes(query.toLowerCase().trim());
    });
  }

  if (selectedCategories.length) {
    preparedProducts = preparedProducts.filter(item => {
      return selectedCategories.includes(item.categoryId);
    });
  }

  if (selectedSortMethod) {
    preparedProducts = getSortedProducts(preparedProducts, selectedSortMethod);
  }

  return isReversed ? [...preparedProducts].reverse() : preparedProducts;
}

export const App = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSortMethod, setSelectedSortMethod] = useState(null);
  const [isReversed, setIsReversed] = useState(false);
  const [query, setQuery] = useState('');

  const selectUser = (id = 'all') => {
    if (id === 'all') {
      setSelectedUser(null);

      return;
    }

    if (selectUser.id !== id) {
      setSelectedUser(usersFromServer.find(user => user.id === id));
    }
  };

  const selectCategory = id => {
    if (!selectedCategories.includes(id)) {
      setSelectedCategories(prev => [...prev, id]);
    } else {
      setSelectedCategories(prev => {
        return prev.filter(categoryId => categoryId !== id);
      });
    }
  };

  const selectAllCategories = () => {
    if (selectedCategories.length) {
      setSelectedCategories([]);
    }
  };

  const selectSortMethod = method => {
    if (selectedSortMethod !== method) {
      setSelectedSortMethod(method);
      setIsReversed(false);
    } else if (selectedSortMethod === method && !isReversed) {
      setIsReversed(true);
    } else {
      setSelectedSortMethod(null);
      setIsReversed(false);
    }
  };

  const updateQuery = newQuery => {
    if (newQuery.trimStart() !== query) {
      setQuery(newQuery.trimStart());
    }
  };

  const resetQuery = () => {
    setQuery('');
  };

  const resetFilters = () => {
    setSelectedUser(null);
    setQuery('');
    setSelectedCategories([]);
  };

  const preparedProducts = getPreparedProducts(products, {
    selectedUser,
    query,
    selectedCategories,
    selectedSortMethod,
    isReversed,
  });

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': !selectedUser })}
                onClick={selectUser}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={cn({ 'is-active': user.id === selectedUser?.id })}
                  onClick={() => selectUser(user.id)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => updateQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={resetQuery}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length,
                })}
                onClick={selectAllCategories}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category.id),
                  })}
                  onClick={() => selectCategory(category.id)}
                  href="#/"
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {preparedProducts.length ? (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {SORT_METHODS.map(method => (
                    <th key={method}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {method}
                        <a href="#/" onClick={() => selectSortMethod(method)}>
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={cn('fas', {
                                'fa-sort': selectedSortMethod !== method,
                                'fa-sort-down':
                                  isReversed && selectedSortMethod === method,
                                'fa-sort-up':
                                  !isReversed && selectedSortMethod === method,
                              })}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {preparedProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={
                        product.user.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
