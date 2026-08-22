"use strict";

const {
  darken,
  escapeXmlAttribute: escapeXmlAttr,
  hexToIntelliJ,
  lighten,
  mix,
} = require("./colors");
const { createAccessibleEditorPalette, toIntelliJTokens } = require("./semantic-tokens");

function generateEditorSchemeXml(entry) {
  const { slug, name, colors, levels, ui, light } = entry;
  const isDark = !light;
  const semantic = toIntelliJTokens(entry);
  const accessible = createAccessibleEditorPalette(entry);

  const bg = hexToIntelliJ(ui.uibackground);
  const fg = hexToIntelliJ(ui.font);
  const fgAlt = hexToIntelliJ(ui.fontalt);
  const border = hexToIntelliJ(ui.border);
  const selection = semantic.selection;
  const lineHighlight = semantic.lineHighlight;
  const gutter = hexToIntelliJ(ui.uibackgroundalt);
  const caretRow = semantic.caretRow;

  // Convert colors to IntelliJ hex (no #)
  const c = {};
  for (const [k, v] of Object.entries(accessible.colors)) c[k] = hexToIntelliJ(v);
  const l = {};
  for (const [k, v] of Object.entries(accessible.levels)) l[k] = hexToIntelliJ(v);

  const pri = hexToIntelliJ(ui.primary);

  // Build editor scheme colors for diff, search, etc.
  const addedBg = semantic.diff.added;
  const deletedBg = semantic.diff.deleted;
  const modifiedBg = semantic.diff.modified;
  const conflictBg = semantic.diff.conflict;

  const addedStripe = hexToIntelliJ(levels.success);
  const deletedStripe = hexToIntelliJ(levels.danger);
  const modifiedStripe = hexToIntelliJ(levels.info);
  const conflictStripe = hexToIntelliJ(levels.warning);

  const searchBg = semantic.search.result;
  const searchWriteBg = semantic.search.write;

  const bracketBg = semantic.bracketBackground;

  const xmlName = escapeXmlAttr(name);

  return `<?xml version="1.0" encoding="UTF-8"?>
<scheme name="${xmlName}" version="142" parent_scheme="${isDark ? "Darcula" : "Default"}">
  <metaInfo>
    <property name="created">2026-08-21T00:00:00</property>
    <property name="ide">Idea</property>
    <property name="ideVersion">2025.3.0.0</property>
    <property name="modified">2026-08-21T00:00:00</property>
    <property name="originalScheme">${xmlName}</property>
  </metaInfo>
  <colors>
    <option name="ADDED_LINES_COLOR" value="${addedStripe}" />
    <option name="ANNOTATIONS_COLOR" value="${fgAlt}" />
    <option name="CARET_COLOR" value="${fg}" />
    <option name="CARET_ROW_COLOR" value="${caretRow}" />
    <option name="CONSOLE_BACKGROUND_KEY" value="${bg}" />
    <option name="DELETED_LINES_COLOR" value="${deletedStripe}" />
    <option name="DIFF_SEPARATORS_BACKGROUND" value="${hexToIntelliJ(ui.uibackgroundalt)}" />
    <option name="DOCUMENTATION_COLOR" value="${bg}" />
    <option name="DOC_COMMENT_GUIDE" value="${border}" />
    <option name="DOC_COMMENT_LINK" value="${c.blue}" />
    <option name="ERROR_HINT" value="${l.danger}" />
    <option name="FILESTATUS_ADDED" value="${l.success}" />
    <option name="FILESTATUS_DELETED" value="${l.danger}" />
    <option name="FILESTATUS_IDEA_FILESTATUS_DELETED_FROM_FILE_SYSTEM" value="${fgAlt}" />
    <option name="FILESTATUS_IDEA_FILESTATUS_IGNORED" value="${fgAlt}" />
    <option name="FILESTATUS_IDEA_FILESTATUS_MERGED_WITH_BOTH_CONFLICTS" value="${l.warning}" />
    <option name="FILESTATUS_IDEA_FILESTATUS_MERGED_WITH_CONFLICTS" value="${l.warning}" />
    <option name="FILESTATUS_IDEA_FILESTATUS_MERGED_WITH_PROPERTY_CONFLICTS" value="${l.warning}" />
    <option name="FILESTATUS_MERGED" value="${c.purple}" />
    <option name="FILESTATUS_MODIFIED" value="${l.info}" />
    <option name="FILESTATUS_NOT_CHANGED_IMMEDIATE" value="${l.info}" />
    <option name="FILESTATUS_NOT_CHANGED_RECURSIVE" value="${l.info}" />
    <option name="FILESTATUS_UNKNOWN" value="${l.danger}" />
    <option name="FILESTATUS_addedOutside" value="${l.success}" />
    <option name="FILESTATUS_changelistConflict" value="${l.warning}" />
    <option name="FILESTATUS_modifiedOutside" value="${l.info}" />
    <option name="FOLDED_TEXT_BORDER_COLOR" value="${border}" />
    <option name="GUTTER_BACKGROUND" value="${bg}" />
    <option name="IGNORED_ADDED_LINES_BORDER_COLOR" value="${addedStripe}" />
    <option name="IGNORED_DELETED_LINES_BORDER_COLOR" value="${deletedStripe}" />
    <option name="IGNORED_MODIFIED_LINES_BORDER_COLOR" value="${modifiedStripe}" />
    <option name="INDENT_GUIDE" value="${border}" />
    <option name="INFORMATION_HINT" value="${hexToIntelliJ(ui.uibackgroundalt)}" />
    <option name="LINE_NUMBER_ON_CARET_ROW_COLOR" value="${fg}" />
    <option name="LINE_NUMBERS_COLOR" value="${fgAlt}" />
    <option name="LOOKUP_COLOR" value="${bg}" />
    <option name="METHOD_SEPARATORS_COLOR" value="${border}" />
    <option name="MODIFIED_LINES_COLOR" value="${modifiedStripe}" />
    <option name="NOTIFICATION_BACKGROUND" value="${hexToIntelliJ(ui.uibackgroundalt)}" />
    <option name="QUESTION_HINT" value="${hexToIntelliJ(ui.uibackgroundalt)}" />
    <option name="RECENT_LOCATIONS_SELECTION" value="${hexToIntelliJ(ui.defaultalt)}" />
    <option name="RIGHT_MARGIN_COLOR" value="${border}" />
    <option name="SCROLL_BAR_THUMB_BORDER" value="${hexToIntelliJ(isDark ? lighten(ui.uibackground, 15) : darken(ui.uibackground, 15))}" />
    <option name="SCROLL_BAR_THUMB_COLOR" value="${hexToIntelliJ(isDark ? lighten(ui.uibackground, 12) : darken(ui.uibackground, 12))}" />
    <option name="SELECTED_INDENT_GUIDE" value="${fgAlt}" />
    <option name="SELECTED_TEARLINE_COLOR" value="${fgAlt}" />
    <option name="SELECTION_BACKGROUND" value="${selection}" />
    <option name="SELECTION_FOREGROUND" />
    <option name="SEPARATOR_ABOVE_COLOR" value="${border}" />
    <option name="SEPARATOR_BELOW_COLOR" value="${border}" />
    <option name="SOFT_WRAP_SIGN_COLOR" value="${fgAlt}" />
    <option name="TEARLINE_COLOR" value="${border}" />
    <option name="VCS_ANNOTATIONS_COLOR_1" value="${addedBg}" />
    <option name="VCS_ANNOTATIONS_COLOR_2" value="${modifiedBg}" />
    <option name="VCS_ANNOTATIONS_COLOR_3" value="${conflictBg}" />
    <option name="VCS_ANNOTATIONS_COLOR_4" value="${deletedBg}" />
    <option name="VCS_ANNOTATIONS_COLOR_5" value="${hexToIntelliJ(ui.defaultalt)}" />
    <option name="VISUAL_INDENT_GUIDE" value="${border}" />
    <option name="WHITESPACES" value="${border}" />
    <option name="WHITESPACES_MODIFIED_LINES_COLOR" value="${modifiedStripe}" />
  </colors>
  <attributes>
    <!-- Default text -->
    <option name="TEXT">
      <value>
        <option name="FOREGROUND" value="${fg}" />
        <option name="BACKGROUND" value="${bg}" />
      </value>
    </option>

    <!-- Comments -->
    <option name="DEFAULT_BLOCK_COMMENT">
      <value>
        <option name="FOREGROUND" value="${fgAlt}" />
        <option name="FONT_TYPE" value="2" />
      </value>
    </option>
    <option name="DEFAULT_LINE_COMMENT">
      <value>
        <option name="FOREGROUND" value="${fgAlt}" />
        <option name="FONT_TYPE" value="2" />
      </value>
    </option>
    <option name="DEFAULT_DOC_COMMENT">
      <value>
        <option name="FOREGROUND" value="${fgAlt}" />
        <option name="FONT_TYPE" value="2" />
      </value>
    </option>
    <option name="DEFAULT_DOC_COMMENT_TAG">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
        <option name="FONT_TYPE" value="3" />
      </value>
    </option>
    <option name="DEFAULT_DOC_COMMENT_TAG_VALUE">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
    <option name="DEFAULT_DOC_MARKUP">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>

    <!-- Keywords -->
    <option name="DEFAULT_KEYWORD">
      <value>
        <option name="FOREGROUND" value="${c.yellow}" />
      </value>
    </option>

    <!-- Strings -->
    <option name="DEFAULT_STRING">
      <value>
        <option name="FOREGROUND" value="${c.green}" />
      </value>
    </option>
    <option name="DEFAULT_VALID_STRING_ESCAPE">
      <value>
        <option name="FOREGROUND" value="${c.turquoize}" />
        <option name="FONT_TYPE" value="1" />
      </value>
    </option>
    <option name="DEFAULT_INVALID_STRING_ESCAPE">
      <value>
        <option name="FOREGROUND" value="${l.danger}" />
        <option name="EFFECT_TYPE" value="1" />
      </value>
    </option>

    <!-- Numbers -->
    <option name="DEFAULT_NUMBER">
      <value>
        <option name="FOREGROUND" value="${c.red}" />
      </value>
    </option>

    <!-- Constants -->
    <option name="DEFAULT_CONSTANT">
      <value>
        <option name="FOREGROUND" value="${c.red}" />
      </value>
    </option>
    <option name="DEFAULT_PREDEFINED_SYMBOL">
      <value>
        <option name="FOREGROUND" value="${c.red}" />
      </value>
    </option>

    <!-- Functions -->
    <option name="DEFAULT_FUNCTION_CALL">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="DEFAULT_FUNCTION_DECLARATION">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="DEFAULT_STATIC_METHOD">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
        <option name="FONT_TYPE" value="2" />
      </value>
    </option>

    <!-- Types / Classes -->
    <option name="DEFAULT_CLASS_NAME">
      <value>
        <option name="FOREGROUND" value="${c.greenAlt}" />
      </value>
    </option>
    <option name="DEFAULT_CLASS_REFERENCE">
      <value>
        <option name="FOREGROUND" value="${c.greenAlt}" />
      </value>
    </option>
    <option name="DEFAULT_INTERFACE_NAME">
      <value>
        <option name="FOREGROUND" value="${c.greenAlt}" />
        <option name="FONT_TYPE" value="2" />
      </value>
    </option>

    <!-- Type parameters -->
    <option name="TYPE_PARAMETER_NAME_ATTRIBUTES">
      <value>
        <option name="FOREGROUND" value="${c.purple}" />
      </value>
    </option>

    <!-- Variables -->
    <option name="DEFAULT_LOCAL_VARIABLE">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
    <option name="DEFAULT_GLOBAL_VARIABLE">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
    <option name="DEFAULT_INSTANCE_FIELD">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
      </value>
    </option>
    <option name="DEFAULT_INSTANCE_METHOD">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="DEFAULT_STATIC_FIELD">
      <value>
        <option name="FOREGROUND" value="${c.red}" />
        <option name="FONT_TYPE" value="2" />
      </value>
    </option>

    <!-- Parameters -->
    <option name="DEFAULT_PARAMETER">
      <value>
        <option name="FOREGROUND" value="${c.pink}" />
      </value>
    </option>

    <!-- Decorators / Annotations -->
    <option name="DEFAULT_METADATA">
      <value>
        <option name="FOREGROUND" value="${c.pink}" />
      </value>
    </option>

    <!-- Operators -->
    <option name="DEFAULT_OPERATION_SIGN">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>

    <!-- Brackets -->
    <option name="DEFAULT_BRACKETS">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>
    <option name="DEFAULT_PARENTHS">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>
    <option name="DEFAULT_BRACES">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>
    <option name="DEFAULT_DOT">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>
    <option name="DEFAULT_COMMA">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>
    <option name="DEFAULT_SEMICOLON">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>

    <!-- Labels -->
    <option name="DEFAULT_LABEL">
      <value>
        <option name="FOREGROUND" value="${c.pink}" />
      </value>
    </option>

    <!-- Template language -->
    <option name="DEFAULT_TEMPLATE_LANGUAGE_COLOR">
      <value>
        <option name="FOREGROUND" value="${c.yellow}" />
      </value>
    </option>

    <!-- Markup (HTML/XML) -->
    <option name="DEFAULT_TAG">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
    <option name="DEFAULT_ATTRIBUTE">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
      </value>
    </option>
    <option name="DEFAULT_ENTITY">
      <value>
        <option name="FOREGROUND" value="${c.turquoize}" />
      </value>
    </option>
    <option name="HTML_TAG_NAME">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
    <option name="HTML_ATTRIBUTE_NAME">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
      </value>
    </option>
    <option name="HTML_ATTRIBUTE_VALUE">
      <value>
        <option name="FOREGROUND" value="${c.green}" />
      </value>
    </option>
    <option name="XML_TAG_NAME">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
    <option name="XML_ATTRIBUTE_NAME">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
      </value>
    </option>
    <option name="XML_ATTRIBUTE_VALUE">
      <value>
        <option name="FOREGROUND" value="${c.green}" />
      </value>
    </option>

    <!-- CSS -->
    <option name="CSS.PROPERTY_NAME">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="CSS.PROPERTY_VALUE">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
    <option name="CSS.TAG_NAME">
      <value>
        <option name="FOREGROUND" value="${c.yellow}" />
      </value>
    </option>
    <option name="CSS.CLASS_NAME">
      <value>
        <option name="FOREGROUND" value="${c.greenAlt}" />
      </value>
    </option>
    <option name="CSS.PSEUDO">
      <value>
        <option name="FOREGROUND" value="${c.purple}" />
      </value>
    </option>
    <option name="CSS.FUNCTION">
      <value>
        <option name="FOREGROUND" value="${c.turquoize}" />
      </value>
    </option>
    <option name="CSS.COLOR">
      <value>
        <option name="FOREGROUND" value="${c.red}" />
      </value>
    </option>
    <option name="CSS.NUMBER">
      <value>
        <option name="FOREGROUND" value="${c.red}" />
      </value>
    </option>
    <option name="CSS.URL">
      <value>
        <option name="FOREGROUND" value="${c.green}" />
      </value>
    </option>
    <option name="CSS.IDENT">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
      </value>
    </option>

    <!-- JSON -->
    <option name="JSON.PROPERTY_KEY">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>

    <!-- YAML -->
    <option name="YAML_SCALAR_KEY">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="YAML_SCALAR_VALUE">
      <value>
        <option name="FOREGROUND" value="${c.green}" />
      </value>
    </option>

    <!-- Markdown -->
    <option name="MARKDOWN_HEADER_LEVEL_1">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
        <option name="FONT_TYPE" value="1" />
      </value>
    </option>
    <option name="MARKDOWN_HEADER_LEVEL_2">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
        <option name="FONT_TYPE" value="1" />
      </value>
    </option>
    <option name="MARKDOWN_HEADER_LEVEL_3">
      <value>
        <option name="FOREGROUND" value="${c.yellow}" />
        <option name="FONT_TYPE" value="1" />
      </value>
    </option>
    <option name="MARKDOWN_HEADER_LEVEL_4">
      <value>
        <option name="FOREGROUND" value="${c.green}" />
        <option name="FONT_TYPE" value="1" />
      </value>
    </option>
    <option name="MARKDOWN_BOLD">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
        <option name="FONT_TYPE" value="1" />
      </value>
    </option>
    <option name="MARKDOWN_ITALIC">
      <value>
        <option name="FOREGROUND" value="${c.pink}" />
        <option name="FONT_TYPE" value="2" />
      </value>
    </option>
    <option name="MARKDOWN_CODE_SPAN">
      <value>
        <option name="FOREGROUND" value="${c.turquoize}" />
      </value>
    </option>
    <option name="MARKDOWN_LINK_DESTINATION">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="MARKDOWN_LINK_TEXT">
      <value>
        <option name="FOREGROUND" value="${c.green}" />
      </value>
    </option>

    <!-- Diff -->
    <option name="DIFF_INSERTED">
      <value>
        <option name="BACKGROUND" value="${addedBg}" />
      </value>
    </option>
    <option name="DIFF_DELETED">
      <value>
        <option name="BACKGROUND" value="${deletedBg}" />
      </value>
    </option>
    <option name="DIFF_MODIFIED">
      <value>
        <option name="BACKGROUND" value="${modifiedBg}" />
      </value>
    </option>
    <option name="DIFF_CONFLICT">
      <value>
        <option name="BACKGROUND" value="${conflictBg}" />
      </value>
    </option>

    <!-- Search results -->
    <option name="SEARCH_RESULT_ATTRIBUTES">
      <value>
        <option name="BACKGROUND" value="${searchBg}" />
        <option name="ERROR_STRIPE_COLOR" value="${searchBg}" />
      </value>
    </option>
    <option name="WRITE_SEARCH_RESULT_ATTRIBUTES">
      <value>
        <option name="BACKGROUND" value="${searchWriteBg}" />
        <option name="ERROR_STRIPE_COLOR" value="${searchWriteBg}" />
      </value>
    </option>
    <option name="TEXT_SEARCH_RESULT_ATTRIBUTES">
      <value>
        <option name="BACKGROUND" value="${searchBg}" />
        <option name="ERROR_STRIPE_COLOR" value="${searchBg}" />
      </value>
    </option>

    <!-- Matched brace -->
    <option name="MATCHED_BRACE_ATTRIBUTES">
      <value>
        <option name="BACKGROUND" value="${bracketBg}" />
        <option name="FONT_TYPE" value="1" />
      </value>
    </option>
    <option name="UNMATCHED_BRACE_ATTRIBUTES">
      <value>
        <option name="FOREGROUND" value="${l.danger}" />
        <option name="FONT_TYPE" value="1" />
        <option name="EFFECT_TYPE" value="1" />
      </value>
    </option>

    <!-- Errors / Warnings -->
    <option name="ERRORS_ATTRIBUTES">
      <value>
        <option name="EFFECT_COLOR" value="${l.danger}" />
        <option name="ERROR_STRIPE_COLOR" value="${l.danger}" />
        <option name="EFFECT_TYPE" value="1" />
      </value>
    </option>
    <option name="WARNING_ATTRIBUTES">
      <value>
        <option name="EFFECT_COLOR" value="${l.warning}" />
        <option name="ERROR_STRIPE_COLOR" value="${l.warning}" />
        <option name="EFFECT_TYPE" value="1" />
      </value>
    </option>
    <option name="INFO_ATTRIBUTES">
      <value>
        <option name="EFFECT_COLOR" value="${l.info}" />
        <option name="EFFECT_TYPE" value="1" />
      </value>
    </option>
    <option name="DEPRECATED_ATTRIBUTES">
      <value>
        <option name="EFFECT_COLOR" value="${fgAlt}" />
        <option name="EFFECT_TYPE" value="5" />
      </value>
    </option>
    <option name="NOT_USED_ELEMENT_ATTRIBUTES">
      <value>
        <option name="FOREGROUND" value="${fgAlt}" />
        <option name="EFFECT_TYPE" value="5" />
      </value>
    </option>
    <option name="WRONG_REFERENCES_ATTRIBUTES">
      <value>
        <option name="FOREGROUND" value="${l.danger}" />
        <option name="EFFECT_TYPE" value="1" />
      </value>
    </option>

    <!-- Hyperlinks -->
    <option name="HYPERLINK_ATTRIBUTES">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
        <option name="EFFECT_COLOR" value="${c.blue}" />
        <option name="EFFECT_TYPE" value="1" />
      </value>
    </option>
    <option name="FOLLOWED_HYPERLINK_ATTRIBUTES">
      <value>
        <option name="FOREGROUND" value="${c.purple}" />
        <option name="EFFECT_COLOR" value="${c.purple}" />
        <option name="EFFECT_TYPE" value="1" />
      </value>
    </option>

    <!-- Injected language fragment -->
    <option name="INJECTED_LANGUAGE_FRAGMENT">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>

    <!-- TODO -->
    <option name="TODO_DEFAULT_ATTRIBUTES">
      <value>
        <option name="FOREGROUND" value="${c.yellow}" />
        <option name="FONT_TYPE" value="3" />
        <option name="ERROR_STRIPE_COLOR" value="${hexToIntelliJ(colors.yellow)}" />
      </value>
    </option>

    <!-- Identifier under caret -->
    <option name="IDENTIFIER_UNDER_CARET_ATTRIBUTES">
      <value>
        <option name="BACKGROUND" value="${hexToIntelliJ(isDark ? lighten(ui.uibackground, 10) : darken(ui.uibackground, 10))}" />
        <option name="ERROR_STRIPE_COLOR" value="${pri}" />
      </value>
    </option>
    <option name="WRITE_IDENTIFIER_UNDER_CARET_ATTRIBUTES">
      <value>
        <option name="BACKGROUND" value="${hexToIntelliJ(isDark ? lighten(ui.uibackground, 15) : darken(ui.uibackground, 15))}" />
        <option name="ERROR_STRIPE_COLOR" value="${pri}" />
      </value>
    </option>

    <!-- Breadcrumbs -->
    <option name="BREADCRUMBS_CURRENT">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>
    <option name="BREADCRUMBS_DEFAULT">
      <value>
        <option name="FOREGROUND" value="${fgAlt}" />
      </value>
    </option>
    <option name="BREADCRUMBS_HOVERED">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>
    <option name="BREADCRUMBS_INACTIVE">
      <value>
        <option name="FOREGROUND" value="${fgAlt}" />
      </value>
    </option>

    <!-- Console -->
    <option name="CONSOLE_NORMAL_OUTPUT">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>
    <option name="CONSOLE_ERROR_OUTPUT">
      <value>
        <option name="FOREGROUND" value="${l.danger}" />
      </value>
    </option>
    <option name="CONSOLE_USER_INPUT">
      <value>
        <option name="FOREGROUND" value="${c.green}" />
      </value>
    </option>
    <option name="CONSOLE_SYSTEM_OUTPUT">
      <value>
        <option name="FOREGROUND" value="${fgAlt}" />
      </value>
    </option>
    <option name="LOG_ERROR_OUTPUT">
      <value>
        <option name="FOREGROUND" value="${l.danger}" />
      </value>
    </option>
    <option name="LOG_WARNING_OUTPUT">
      <value>
        <option name="FOREGROUND" value="${l.warning}" />
      </value>
    </option>

    <!-- Terminal ANSI colors -->
    <option name="TERMINAL_COMMAND_TO_RUN_USING_IDE">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>

    <!-- Kotlin specific -->
    <option name="KOTLIN_FUNCTION_LITERAL_BRACES_AND_ARROW">
      <value>
        <option name="FOREGROUND" value="${fg}" />
      </value>
    </option>
    <option name="KOTLIN_LABEL">
      <value>
        <option name="FOREGROUND" value="${c.pink}" />
      </value>
    </option>
    <option name="KOTLIN_NAMED_ARGUMENT">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
      </value>
    </option>

    <!-- Enumerated references -->
    <option name="ENUM_CONST">
      <value>
        <option name="FOREGROUND" value="${c.red}" />
      </value>
    </option>

    <!-- Inline parameter hints -->
    <option name="INLINE_PARAMETER_HINT">
      <value>
        <option name="FOREGROUND" value="${fgAlt}" />
        <option name="BACKGROUND" value="${hexToIntelliJ(ui.defaultalt)}" />
      </value>
    </option>
    <option name="INLINE_PARAMETER_HINT_CURRENT">
      <value>
        <option name="FOREGROUND" value="${fg}" />
        <option name="BACKGROUND" value="${hexToIntelliJ(isDark ? lighten(ui.defaultalt, 10) : darken(ui.defaultalt, 10))}" />
      </value>
    </option>
    <option name="INLINE_PARAMETER_HINT_HIGHLIGHTED">
      <value>
        <option name="FOREGROUND" value="${fg}" />
        <option name="BACKGROUND" value="${hexToIntelliJ(isDark ? lighten(ui.defaultalt, 5) : darken(ui.defaultalt, 5))}" />
      </value>
    </option>

    <!-- Rainbow brackets support -->
    <option name="RAINBOW_COLOR1">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
    <option name="RAINBOW_COLOR2">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
      </value>
    </option>
    <option name="RAINBOW_COLOR3">
      <value>
        <option name="FOREGROUND" value="${c.yellow}" />
      </value>
    </option>
    <option name="RAINBOW_COLOR4">
      <value>
        <option name="FOREGROUND" value="${c.green}" />
      </value>
    </option>
    <option name="RAINBOW_COLOR5">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>

    <!-- Semantic Highlighting (Java/Kotlin) -->
    <option name="REASSIGNED_LOCAL_VARIABLE">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
        <option name="EFFECT_TYPE" value="1" />
      </value>
    </option>
    <option name="REASSIGNED_PARAMETER">
      <value>
        <option name="FOREGROUND" value="${c.pink}" />
        <option name="EFFECT_TYPE" value="1" />
      </value>
    </option>
    <option name="IMPLICIT_ANONYMOUS_CLASS_PARAMETER">
      <value>
        <option name="FOREGROUND" value="${c.pink}" />
      </value>
    </option>

    <!-- TypeScript / JavaScript -->
    <option name="JS.GLOBAL_VARIABLE">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
    <option name="JS.LOCAL_VARIABLE">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
    <option name="JS.PARAMETER">
      <value>
        <option name="FOREGROUND" value="${c.pink}" />
      </value>
    </option>
    <option name="JS.INSTANCE_MEMBER_FUNCTION">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="JS.GLOBAL_FUNCTION">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="JS.REGEXP">
      <value>
        <option name="FOREGROUND" value="${c.turquoize}" />
      </value>
    </option>
    <option name="TS.TYPE_PARAMETER">
      <value>
        <option name="FOREGROUND" value="${c.purple}" />
      </value>
    </option>

    <!-- Python -->
    <option name="PY.BUILTIN_NAME">
      <value>
        <option name="FOREGROUND" value="${c.turquoize}" />
      </value>
    </option>
    <option name="PY.DECORATOR">
      <value>
        <option name="FOREGROUND" value="${c.pink}" />
      </value>
    </option>
    <option name="PY.KEYWORD_ARGUMENT">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
      </value>
    </option>
    <option name="PY.PREDEFINED_USAGE">
      <value>
        <option name="FOREGROUND" value="${c.turquoize}" />
      </value>
    </option>
    <option name="PY.SELF_PARAMETER">
      <value>
        <option name="FOREGROUND" value="${c.red}" />
        <option name="FONT_TYPE" value="2" />
      </value>
    </option>
    <option name="PY.FUNC_DEFINITION">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="PY.CLASS_DEFINITION">
      <value>
        <option name="FOREGROUND" value="${c.greenAlt}" />
      </value>
    </option>

    <!-- Go -->
    <option name="GO_BUILTIN_FUNCTION_CALL">
      <value>
        <option name="FOREGROUND" value="${c.turquoize}" />
      </value>
    </option>
    <option name="GO_BUILTIN_TYPE_REFERENCE">
      <value>
        <option name="FOREGROUND" value="${c.purple}" />
      </value>
    </option>
    <option name="GO_BUILTIN_VARIABLE">
      <value>
        <option name="FOREGROUND" value="${c.red}" />
      </value>
    </option>
    <option name="GO_EXPORTED_FUNCTION">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="GO_LOCAL_FUNCTION">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="GO_PACKAGE_EXPORTED_VARIABLE">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
    <option name="GO_STRUCT_EXPORTED_MEMBER">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
      </value>
    </option>
    <option name="GO_STRUCT_LOCAL_MEMBER">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
      </value>
    </option>
    <option name="GO_TYPE_REFERENCE">
      <value>
        <option name="FOREGROUND" value="${c.greenAlt}" />
      </value>
    </option>

    <!-- Rust -->
    <option name="org.rust.FIELD">
      <value>
        <option name="FOREGROUND" value="${c.orange}" />
      </value>
    </option>
    <option name="org.rust.FUNCTION">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="org.rust.METHOD">
      <value>
        <option name="FOREGROUND" value="${c.blue}" />
      </value>
    </option>
    <option name="org.rust.MACRO">
      <value>
        <option name="FOREGROUND" value="${c.turquoize}" />
      </value>
    </option>
    <option name="org.rust.MUT_BINDING">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
        <option name="EFFECT_TYPE" value="1" />
      </value>
    </option>
    <option name="org.rust.STRUCT">
      <value>
        <option name="FOREGROUND" value="${c.greenAlt}" />
      </value>
    </option>
    <option name="org.rust.TRAIT">
      <value>
        <option name="FOREGROUND" value="${c.greenAlt}" />
        <option name="FONT_TYPE" value="2" />
      </value>
    </option>
    <option name="org.rust.TYPE_ALIAS">
      <value>
        <option name="FOREGROUND" value="${c.purple}" />
      </value>
    </option>
    <option name="org.rust.LIFETIME">
      <value>
        <option name="FOREGROUND" value="${c.purple}" />
        <option name="FONT_TYPE" value="2" />
      </value>
    </option>
    <option name="org.rust.ATTRIBUTE">
      <value>
        <option name="FOREGROUND" value="${c.pink}" />
      </value>
    </option>

    <!-- PHP -->
    <option name="PHP_VAR">
      <value>
        <option name="FOREGROUND" value="${c.salmon}" />
      </value>
    </option>
  </attributes>
</scheme>
`;
}


module.exports = { generateEditorSchemeXml };
