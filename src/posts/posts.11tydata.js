export default {
  layout: "layouts/post.njk",
  tags: ["posts"],
  permalink: (data) => {
    const match = data.page.inputPath.match(/(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    const [, isoDate, slug] = match;
    return `/${isoDate}/${slug}/`;
  },
};
