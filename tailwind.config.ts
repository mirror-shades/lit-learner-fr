import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],

    daisyui: {
        themes: ["nord"],
      },

    plugins: [require("daisyui")],

} as Config;