const fs = require("fs").promises;
const uuid = require("shortid");
const jdown = require('jdown');

const TAG_DIRECTORY = "tags";

const customTags = require("./tags.json").tags;

const convertTagToMarkdown = function (tag) {
  return "---\nid: " + tag.id + "\ntitle: " + tag.title + "\n---";
};

(async () => {
  const existingMarkdownTags = await jdown(TAG_DIRECTORY);

  /**
   * Prevention of duplicates
   */
  const tagIndex = new Set();
  const uuidIndex = new Set();

  /**
   * All-tags collection
   */
  const tags = [];

  /**
   * Make sure uuid is not clashing with existing ones
   */
  const getUUID = function () {
    let newID;
    do {
      newID = uuid();
    } while (uuidIndex.has(newID))
    return newID;
  }

  /**
   *
   */
  const createTagIfNotExists = function (tag) {
    if (!tagIndex.has(tag.toLowerCase())) {
      const id = getUUID();
      tagIndex.add(tag.toLowerCase());
      uuidIndex.add(id);
      tags.push({id, title: tag})
    }
  }

  /**
   * Read existing markdowns and register UUIDs
   */
  for (let key in existingMarkdownTags) {
    let tag = existingMarkdownTags[key];
    if (tag.id !== undefined) {
      uuidIndex.add(tag.id);
      tagIndex.add(tag.title.toLowerCase());
      tags.push(tag);
    } else createTagIfNotExists(tag.title);
  }

  /**
   * Create custom tags that
   * do not exist already
   */
  for (let key in customTags) {
    const tag = customTags[key];
    createTagIfNotExists(tag);
  }

  /**
   * Generate files from
   */
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    let file = convertTagToMarkdown(tag);
    await fs.writeFile(TAG_DIRECTORY + "/tag-" + tag.title.toLowerCase() + ".md", file);
  }

})();

