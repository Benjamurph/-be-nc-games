const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');
const db = require('../db/connection');
const request = require('supertest');
const app = require('../app');

beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    return db.end();
});

describe('GET api/categories', () => {
    describe('happy path', () => {
        test('200 status: returns an array containing all the categories', () => {
            return request(app)
            .get('/api/categories')
            .expect(200)
            .then(({body}) => {
                body.categories.forEach(category => {
                    expect(category).toHaveProperty('description');
                    expect(category).toHaveProperty('slug');
                });
                expect(body.categories.length).toBe(4);
            });
        });
    });
    describe('error handling', () => {
        test('404 status: receives the message "404 route not found." when presented with an invalid path', () => {
      return request(app)
      .get('/api/vategories')
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('404 route not found.');
      });        
    });
  });   
});

describe('GET api/reviews/:review_id', () => {
    describe('happy paths', () => {
        test('200 status: returns the review that corresponds to the input review_id, including comment count', () => {
            return request(app)
            .get('/api/reviews/2')
            .expect(200)
            .then(({body}) => {
              expect(body.review).toEqual({
                review_id: 2,
                title: 'Jenga',
                category: 'dexterity',
                designer: 'Leslie Scott',
                owner: 'philippaclaire9',
                review_body: 'Fiddly fun for all the family',
                review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                created_at: "Mon Jan 18 2021 10:01:41 GMT+0000 (Greenwich Mean Time)",
                votes: 5,
                comment_count: 3
              });
            });
          });
    });
    describe('error handling', () => {
        test('404 status: returns the message "400 not found, please input a valid path." when presented with a path that doesn\'t exist', () => {
            return request(app)
          .get('/api/reviews/999')
          .expect(404)
          .then(({body}) => {
            expect(body.msg).toBe('no review found under id 999');
          });
        });  
        test('400 status: returns a bad path request', () => {
            return request(app)
            .get('/api/reviews/notanumber')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request');
            });
        });
    });
});

describe('PATCH api/reviews/:review_id', () => {
    describe('happy path', () => {
        test('PATCH 200: updates an existing review to increase or decrease the review/s votes by the given amount', () => {
          const newVote = {
            inc_votes : 1
          }
          return request(app)
          .patch('/api/reviews/1')
          .send(newVote)
          .expect(200)
          .then(({body}) => {
            expect(body.review).toEqual({
                review_id: 1,
                title: 'Agricola',
                category: 'euro game',
                designer: 'Uwe Rosenberg',
                owner: 'mallionaire',
                review_body: 'Farmyard fun!',
                review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                created_at: 'Mon Jan 18 2021 10:00:20 GMT+0000 (Greenwich Mean Time)',
                votes: 2
              });
          });
        });
        test('PATCH 200: updates an existing review to increase or decrease the review/s votes by the given amount, ignores extra properties on the patch', () => {
          const newVote = {
              inc_votes: 1,
              name: 'Mitch'
            }
            return request(app)
          .patch('/api/reviews/1')
          .send(newVote)
          .expect(200)
          .then(({body}) => {
              expect(body.review).toEqual({
                review_id: 1,
                title: 'Agricola',
                category: 'euro game',
                designer: 'Uwe Rosenberg',
                owner: 'mallionaire',
                review_body: 'Farmyard fun!',
                review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                created_at: 'Mon Jan 18 2021 10:00:20 GMT+0000 (Greenwich Mean Time)',
                votes: 2
              });
          });
      });
    });
    describe('error handling', () => {
        test('404 status: returns the message "400 not found, please input a valid path." when presented with a path that doesn\'t exist', () => {
            const newVote = {
                inc_votes : 1
              }
            return request(app)
          .patch('/api/reviews/999')
          .send(newVote)
          .expect(404)
          .then(({body}) => {
            expect(body.msg).toBe('no review found under id 999');
          });
        });  
        test('400 status: returns a bad path request', () => {
            const newVote = {
                inc_votes : 1
              }
            return request(app)
            .patch('/api/reviews/notanumber')
            .send(newVote)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request');
            });
        });
        test('400 status: returns the message "Invalid patch request, please reformat your patch" when the patch does not contain "inc_votes"', () => {
            const newVote = {
                name: 'Mitch'
              }
              return request(app)
            .patch('/api/reviews/1')
            .send(newVote)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Invalid patch request, please reformat your patch');
            });
        });
        test('400 status: returns the message "Invalid patch request, please reformat your patch" when vote_count is of the wrong type', () => {
            const newVote = {
                inc_votes: 'cat',
              }
              return request(app)
            .patch('/api/reviews/1')
            .send(newVote)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Invalid patch request, please reformat your patch');
            });
        });
    });
});

describe('GET api/users', () => {
  describe('happy path', () => {
    test('GET 200: responds with an array of users', () => {
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({body}) => {
          expect(body.users.length).toBe(4);
          body.users.forEach(user => {
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('avatar_url');
          });
        });
    });
  });
});

describe('GET api/reviews', () => {
  describe('happy path', () => {
    test('200 status: returns an array of reviews, including comment_count', () => {
      return request(app)
      .get('/api/reviews')
      .expect(200)
      .then(({body}) => {
        expect(body.reviews.length).toBe(13);
        expect(body.reviews).toBeSortedBy('created_at', {descending: true})
        body.reviews.forEach(review => {
          expect(review).toHaveProperty('review_id');
          expect(review).toHaveProperty('title');
          expect(review).toHaveProperty('designer');
          expect(review).toHaveProperty('owner');
          expect(review).toHaveProperty('review_img_url');
          expect(review).toHaveProperty('review_body');
          expect(review).toHaveProperty('category');
          expect(review).toHaveProperty('created_at');
          expect(review).toHaveProperty('votes');
          expect(review).toHaveProperty('comment_count');
        });
      })
    });
  });
});