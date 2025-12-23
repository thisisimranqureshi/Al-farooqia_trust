import { useEffect } from "react";
import "../components/css/GoogleTranslator.css"; // We'll create this next

export default function GoogleTranslateButton() {
  useEffect(() => {
    // Create script element
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;

    // Define global init function
    window.googleTranslateElementInit = () => {
      if (!window.google || !window.google.translate) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,ur,ar",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      delete window.googleTranslateElementInit;
    };
  }, []);

  return <div id="google_translate_element"></div>;
}
