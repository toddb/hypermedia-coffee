/*global describe beforeEach it expect inject module */

define(['mocks', 'services/resource'], function () {
  'use strict';

  describe('Resource', function () {

    var service, $httpBackend;

    beforeEach(module('app.services'));

    beforeEach(inject(function (_$httpBackend_, Resource) {
      $httpBackend = _$httpBackend_;
      service = Resource;
    }));

    it('instantiates', function () {
      expect(service).not.toBeNull();
    });

    describe('PUT', function () {
      beforeEach(function () {
        $httpBackend.expectPUT('/order/1', {type: 'large'}, {Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json;charset=utf-8"
        }).respond(204);
      });
      it('SUCCESS - calls xhr', function () {
        var spy = jasmine.createSpy('PUT');

        service.put({type: 'large'}, { links: [
          { rel: 'self', href: "/order/1", type: "application/json"}
        ]}).
          then(function success(config) {
            spy(config.status);
          });
        $httpBackend.flush();

        expect(spy).toHaveBeenCalledWith(204);
      });
    });

    describe('POST', function () {
      beforeEach(function () {
        $httpBackend.expectPOST("/order/", {"type": "med"},
          {Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json;charset=utf-8"
          }).
          respond(204, {}, {Location: "/order/1"});
        $httpBackend.expectGET("/order/1").respond({
            links: [
              { rel: "viewstate", href: "/order/1/viewstate/current", type: 'application/json'}
            ],
            type: "med"},
          {Allow: 'GET,PUT,DELETE'}
        );
      });

      it('SUCCESS - calls xhr, returns 204 and GET Location', function () {
        var spy = jasmine.createSpy('POST');

        service.post({type: 'med'}, { links: [
          { rel: 'self', href: "/order/", type: "application/json"}
        ]})
          .then(function (item) {
            spy(item.data);
          });
        $httpBackend.flush();

        expect(spy).toHaveBeenCalledWith(
          { links: [
            { rel: 'viewstate', href: '/order/1/viewstate/current', type: 'application/json' }
          ],
            type: 'med'
          }
        );
      });
    });

    describe('DELETE', function () {
      beforeEach(function () {
        $httpBackend.expectDELETE('/order/1', {Accept: "application/json", "X-Requested-With": "XMLHttpRequest"}).respond(204);
      });

      it('SUCCESS - calls xhr', function () {
        var spy = jasmine.createSpy('DELETE');

        service.del({ links: [
          { rel: 'self', href: "/order/1", type: "application/json"}
        ]}, 'self')
          .then(function (result) {
            spy(result.status);
          });
        $httpBackend.flush();
        expect(spy).toHaveBeenCalledWith(204);
      });
    });

    describe("GET", function () {

      describe('string - item', function () {
        it('STRING GET', function () {
          var success = jasmine.createSpy('Success')
            , failure = jasmine.createSpy('Error')
            , resource = { links: [
              { rel: 'item', href: "/order/1", type: "application/json"}
            ]};
          $httpBackend.expectGET('/order/1', {Accept: "application/json", "X-Requested-With": "XMLHttpRequest"}).respond({});

          service.get(resource, "item", "application/json").
            then(success, failure);
          $httpBackend.flush();

          expect(success).toHaveBeenCalled();
          expect(failure).not.toHaveBeenCalled();
        })
      });

      describe('JSON - one-deep item', function () {
        it('item --> item', function () {
          var success = jasmine.createSpy('item')
            , failure = jasmine.createSpy('error')
            , resource = { links: [
              { rel: 'viewstate', href: "/order/1/viewstate", type: "application/json"}
            ]};

          $httpBackend.expectGET('/order/1/viewstate', {Accept: "application/json", "X-Requested-With": "XMLHttpRequest"}).respond(
            {
              links: [
                {rel: 'current', href: "/order/1/viewstate/1", type: "application/json"}
              ]
            });
          $httpBackend.expectGET('/order/1/viewstate/1', {Accept: "application/json", "X-Requested-With": "XMLHttpRequest"}).respond({some: 'data'});

          service.get(resource, { viewstate: 'current' }, 'application/json').
            then(function (response) {
              success(response.data);
            }, failure);

          $httpBackend.flush();

          expect(success).toHaveBeenCalledWith({some: 'data'});
          expect(failure).not.toHaveBeenCalled();
        });
      });

      describe('JSON - collection with viewstate', function () {

        describe('generate collection resource of orders --> order (1) --> viewstate current', function () {

          var dataElement, links, resource;
          beforeEach(function () {
            dataElement = jasmine.createSpy('Data Element');
            links = jasmine.createSpy('Links');
            resource = { links: [
              { rel: 'collection', href: "/order/", type: "application/json"}
            ]};
          });
          beforeEach(function () {
            $httpBackend.expectGET('/order/', {Accept: "application/json", "X-Requested-With": "XMLHttpRequest"}).respond(
              {
                links: [
                  {rel: 'self', href: "/order/", type: "application/json"},
                  {rel: 'item', href: "/order/1", type: "application/json"}
                ]
              }, {Allow: 'GET,POST'});
            $httpBackend.expectGET('/order/1').respond(
              {
                links: [
                  {rel: 'viewstate', href: "/order/1/viewstate/current", type: "application/json"}
                ],
                type: 'med'
              }, {Allow: 'GET,PUT,DELETE'});
            $httpBackend.expectGET('/order/1/viewstate/current').respond(
              {
                links: [
                  {rel: 'self', href: "/order/1/viewstate/1", type: "application/json"}
                ],
                updateable: true,
                deleteable: true,
                createable: true,
                editable: false
              }, {Allow: 'GET'});
          });

          it('JSON GET', function () {
            service.get(resource, {
              collection: [
                { item: { viewstate: {} }}
              ]
            }).
              then(function (response) {
                dataElement(response.data.item);
                links(response.data.links);
              });
            $httpBackend.flush();

            expect(dataElement).toHaveBeenCalledWith(
              [
                {
                  links: [
                    { rel: 'viewstate', href: '/order/1/viewstate/current', type: 'application/json' }
                  ],
                  type: 'med',
                  viewstate: {
                    links: [
                      { rel: 'self', href: '/order/1/viewstate/1', type: 'application/json' }
                    ],
                    updateable: true,
                    deleteable: true,
                    createable: true,
                    editable: false
                  }
                }
              ]);
            expect(links).toHaveBeenCalledWith(
              [
                {rel: 'self', href: "/order/", type: "application/json"},
                {rel: 'item', href: '/order/1', type: 'application/json'}
              ]);
          });
        });

        describe('generate collection resource of orders --> order (2) --> viewstate current', function () {

          var dataElement, links, resource;
          beforeEach(function () {
            dataElement = jasmine.createSpy('Data Element');
            links = jasmine.createSpy('Links');
            resource = { links: [
              { rel: 'collection', href: "/order/", type: "application/json"}
            ]};
          });
          beforeEach(function () {
            $httpBackend.expectGET('/order/', {Accept: "application/json", "X-Requested-With": "XMLHttpRequest"}).respond(
              {
                links: [
                  {rel: 'self', href: "/order/", type: "application/json"},
                  {rel: 'item', href: "/order/1", type: "application/json"},
                  {rel: 'item', href: "/order/2", type: "application/json"}
                ]
              }, {Allow: 'GET,POST'});
            $httpBackend.expectGET('/order/1').respond(
              {
                links: [
                  {rel: 'viewstate', href: "/order/1/viewstate/current", type: "application/json"}
                ],
                type: 'med'
              }, {Allow: 'GET,PUT,DELETE'});
            $httpBackend.expectGET('/order/2').respond(
              {
                links: [
                  {rel: 'viewstate', href: "/order/2/viewstate/current", type: "application/json"}
                ],
                type: 'large'
              }, {Allow: 'GET,PUT,DELETE'});
            $httpBackend.expectGET('/order/1/viewstate/current').respond(
              {
                links: [
                  {rel: 'self', href: "/order/1/viewstate/1", type: "application/json"}
                ],
                updateable: true,
                deleteable: true,
                createable: true,
                editable: false
              }, {Allow: 'GET'});
            $httpBackend.expectGET('/order/2/viewstate/current').respond(
              {
                links: [
                  {rel: 'self', href: "/order/2/viewstate/2", type: "application/json"}
                ],
                updateable: true,
                deleteable: true,
                createable: true,
                editable: false
              }, {Allow: 'GET'});
          });

          it('JSON GET', function () {
            service.get(resource, {
              collection: [
                { item: { viewstate: {} }}
              ]
            }).
              then(function (response) {
                dataElement(response.data.item);
                links(response.data.links);
              });
            $httpBackend.flush();

            expect(dataElement).toHaveBeenCalledWith(
              [
                {
                  links: [
                    { rel: 'viewstate', href: '/order/1/viewstate/current', type: 'application/json' }
                  ],
                  type: 'med',
                  viewstate: {
                    links: [
                      { rel: 'self', href: '/order/1/viewstate/1', type: 'application/json' }
                    ],
                    updateable: true,
                    deleteable: true,
                    createable: true,
                    editable: false
                  }
                },
                {
                  links: [
                    { rel: 'viewstate', href: '/order/2/viewstate/current', type: 'application/json' }
                  ],
                  type: 'large',
                  viewstate: {
                    links: [
                      { rel: 'self', href: '/order/2/viewstate/2', type: 'application/json' }
                    ],
                    updateable: true,
                    deleteable: true,
                    createable: true,
                    editable: false
                  }
                }
              ]);
            expect(links).toHaveBeenCalledWith(
              [
                {rel: 'self', href: "/order/", type: "application/json"},
                {rel: 'item', href: '/order/1', type: 'application/json'},
                {rel: 'item', href: '/order/2', type: 'application/json'}
              ]);
          });
        });

      });
    });

  });

});