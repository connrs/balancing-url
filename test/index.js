/*jslint node: true, stupid: true */
/*globals describe, before, beforeeach, after, it, suite, test */

var assert = require('assert'),
    path = require('path');

suite('Random Route Urls', function () {
  var BalancingUrl = require('../index.js'),
      oldMathRandom;

  function mockMathRandom(size) {
    oldMathRandom = Math.random;
    Math.random = function () {
      return size;
    };
  }

  function restoreMathRandom() {
    Math.random = oldMathRandom;
  }

  test('Combines a complete Url with only 1 route set', function () {
    var path = '/example_path',
        url = 'http://example.com',
        balancingUrl = new BalancingUrl();

    balancingUrl.setRoute(url);
    assert.equal(balancingUrl.generateUrl(path), url + path);
  });

  test('Builds a Url picking a random route', function () {
    var path = '/example_path',
        urls = [
          'http://example.com',
          'http://example.org',
          'http://example.net'
        ],
        balancingUrl = new BalancingUrl();

    balancingUrl.setRoutes(urls);
    mockMathRandom(1/3);
    assert.equal(balancingUrl.generateUrl(path), urls[1] + path);
    restoreMathRandom();
  });

  test('Builds a Url picking a route by round robin', function () {
    var i, j,
        path = '/example_path',
        urls = [
          'http://example.com',
          'http://example.org',
          'http://example.net'
        ],
        balancingUrl = new BalancingUrl();

    balancingUrl.setRouteType(BalancingUrl.routeTypes.ROUND_ROBIN);
    balancingUrl.setRoutes(urls);
    for (i = 0; i < urls.length * 2; i++) {
      j = i % 3;
      assert.equal(balancingUrl.generateUrl(path), urls[j] + path);
    }
  });

  test('Matches a route by path', function () {
    var path1 = '/example_path/file.jpg',
        path2 = '/example_path_2/file2.jpg',
        url1 = 'http://example.com/file.jpg',
        url2 = 'http://example.net/file2.jpg',
        routes = [
          {
            match: '/example_path',
            urls: [ 'http://example.com' ]
          },
          {
            match: '/example_path_2',
            urls: [ 'http://example.net' ]
          }
        ],
        balancingUrl = new BalancingUrl();

    balancingUrl.setRoutes(routes);
    assert.equal(balancingUrl.generateUrl(path1), url1);
    assert.equal(balancingUrl.generateUrl(path2), url2);
  });

  test('Strips the trailing slash from a route match', function () {
    var path = '/file.jpg',
        url = 'http://example.com',
        routes = [
          {
            match: '/',
            urls: [ 'http://example.com' ]
          }
        ],
        balancingUrl = new BalancingUrl();

    balancingUrl.setRoutes(routes);
    assert.equal(balancingUrl.generateUrl(path), url + path);
  });

  test('Strips the trailing slash from route urls', function () {
    var path = '/file.jpg',
        url = 'http://example.com',
        routes = [
          {
            match: '/',
            urls: [ 'http://example.com/' ]
          }
        ],
        balancingUrl = new BalancingUrl();

    balancingUrl.setRoutes(routes);
    assert.equal(balancingUrl.generateUrl(path), url + path);
  });

  test('Returns undefined when no route matches', function () {
    var path = '/non_matching_path/file.jpg',
        url = 'http://example.com',
        routes = [
          {
            match: '/a_matching_path',
            urls: [ url ]
          }
        ],
        balancingUrl = new BalancingUrl();

    balancingUrl.setRoutes(routes);
    assert.equal(balancingUrl.generateUrl(path), undefined);
  });
});
