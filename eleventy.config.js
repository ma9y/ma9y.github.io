import { DateTime } from "luxon";
import 'dotenv/config'

export default function (eleventyConfig) {
    
    eleventyConfig.addPassthroughCopy("views/assets/img");
    eleventyConfig.addPassthroughCopy("views/assets/js");

    // PLUGINS
    eleventyConfig.addFilter("postDate", (dateObj, format = "LLL d") => {
        return DateTime.fromJSDate(dateObj).toFormat(format);
    });

    eleventyConfig.addFilter("postDate2", (dateObj, format = "LLL d") => {
        return DateTime.fromISO(dateObj).toFormat(format);
    });

    // SHORTCODES
    eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

};

export const config = {

    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk", 

    dir: {
        input: "views",
        layouts: "_layouts",
        output: "dist"
    }
};