module.exports = function (salt) {

  salt = salt || Math.floor(Math.random() * 61439);

  return function (req, res, next) {

    /*
     Basic idea here is that we aren't going to compute an md5 etag hash based on the content.
     Rather when there is a state change we will re-etag with the time
     */
    res.etag = function (id, time) {

      if (!time) {
        console.log("ETag: unable to create on id %s", id)
        return;
      }

      if (!time instanceof Date) {
        time = new Date(time);
      }

      var etag = '"' + id + '-' + salt + '-' + time.toISOString() + '"';
      res.setHeader('Last-Modified', time);
      res.setHeader('ETag', etag);

    }
    next();
  };
};