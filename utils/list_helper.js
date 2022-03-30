var _ = require('lodash');

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, item) => {
    return acc += item.likes
  }, 0)
}

const favouriteBlog = (blogs) => {
  if (!blogs.length) {
    return null
  }

  const fav = blogs.reduce((prev, curr) => {
    return prev.likes < curr.likes ? curr : prev
  })

  return {
    title: fav.title,
    author: fav.author,
    likes: fav.likes
  }
}

const mostBlogs = (blogs) => {
  if (!blogs.length) {
    return null
  }

  const theMostBlogs = _.reduce(_.groupBy(blogs, b => b.author), (prev, curr) => 
    prev.length < curr.length ? curr : prev)

  return {
    author: theMostBlogs[0].author,
    blogs: theMostBlogs.length
  }
}

const mostLikes = (blogs) => {
  if (!blogs.length) {
    return null
  }

  const theMostLikes = _.reduce(_.groupBy(blogs, b => b.author), (prev, curr) => {
    const prevLikes = prev.reduce((acc, el) => acc += el.likes, 0)
    const currLikes = curr.reduce((acc, el) => acc += el.likes, 0)

    return prevLikes < currLikes ? curr : prev
  })

  return {
    author: theMostLikes[0].author,
    likes: theMostLikes.reduce((acc, el) => acc += el.likes, 0)
  }
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes
}