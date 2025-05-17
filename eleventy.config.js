import 'dotenv/config'
import { DateTime } from "luxon";

export default function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy("views/assets/img");
    eleventyConfig.addPassthroughCopy("views/assets/js");

    // FILTERS
    eleventyConfig.addFilter("postDate", (dateObj, format = "LLL d, yyyy") => {
        return DateTime.fromJSDate(dateObj).toFormat(format);
    });

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