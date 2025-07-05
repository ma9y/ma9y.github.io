import { DateTime } from "luxon";
import 'dotenv/config'

export default function (eleventyConfig) {
    
    eleventyConfig.addPassthroughCopy("views/assets/img");
    eleventyConfig.addPassthroughCopy("views/assets/js");

    // PLUGINS
    eleventyConfig.addFilter("date", (dateObj, format = "LLL d", locale = "cs") => {
        return DateTime.fromJSDate(dateObj).setLocale(locale).toFormat(format);
    });

    eleventyConfig.addFilter("dateFromString", (dateObj, format = "LLL d", locale = "cs") => {
    return DateTime.fromISO(dateObj).setLocale(locale).toFormat(format);
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