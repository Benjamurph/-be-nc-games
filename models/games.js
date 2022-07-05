const db = require('../db/connection');

exports.selectCategories = () => {
    return db.query('SELECT * FROM categories;').then((result) => {
        return result.rows;
    });
};

exports.selectReviewById = (id) => {
    const { review_id } = id;
    return db.query(`SELECT reviews.*, COUNT(comments.review_id) AS comment_count FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id;`, [review_id])
    .then((result) => {
        if (!result.rows.length) {
            return Promise.reject({
                status: 404,
                msg: `no review found under id ${review_id}`
            });
        };
        result.rows[0].comment_count = parseInt(result.rows[0].comment_count)
        return result.rows[0];
    });
};

exports.updateVotes = (newVotes, id) => {
  const { review_id } = id;
  if (!newVotes.hasOwnProperty('inc_votes') || isNaN(newVotes.inc_votes)) {
    return Promise.reject({
        status: 400,
        msg: 'Invalid patch request, please reformat your patch'
    });
  };
    return db.query(`UPDATE reviews SET votes = votes + $1 WHERE review_id = $2 RETURNING *;`, [newVotes.inc_votes, review_id])
    .then((result) => {
        if (!result.rows.length) {
            return Promise.reject({
                status: 404,
                msg: `no review found under id ${review_id}`
            });
        };
        return result.rows[0];
    });
};

exports.selectUsers = () => {
    return db.query('SELECT * FROM users;').then((results) => {
        return results.rows;
    });
};

exports.selectReviews = () => {
    return db.query(`SELECT reviews.*, COUNT(comments.review_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    GROUP BY reviews.review_id
    ORDER BY reviews.created_at DESC;`)
    .then((result) => {
        result.rows.forEach(review => review.comment_count = parseInt(review.comment_count));
        return result.rows;
    });
};

exports.selectCommentsByReviewId = (id) => {
    const { review_id } = id;
    return db.query(`SELECT * FROM comments WHERE review_id = $1;`, [review_id])
    .then((results) => {
        if (!results.rows.length) {
            return Promise.reject({
                status: 404,
                msg: `no review found under id ${review_id}`
            });
        };
        return results.rows;
    });
};

exports.insertComment = (newComment, id) => {
    if (!newComment.hasOwnProperty('body') || !newComment.hasOwnProperty('author') || typeof newComment.body !== 'string' || typeof newComment.author !== 'string') {
        return Promise.reject({
            status: 400,
            msg: 'Invalid post request, please reformat your post'
        });
      };
    newComment.votes = 0;
    newComment.review_id = id.review_id;
    newComment.created_at = new Date(Date.now());
    const { body, author, votes, review_id, created_at } = newComment;
    return db.query(`SELECT * FROM reviews WHERE review_id = $1`, [review_id])
    .then((result) => {
        if (!result.rows.length) {
            return Promise.reject({
                status: 404,
                msg: `no review found under id ${review_id}`
            });
        };

    return db.query(`INSERT INTO comments (body, author, votes, review_id, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *;`, [body, author, votes, review_id, created_at])
    .then((result) => {
     
     return result.rows[0];
    });
    })
 
    
 };