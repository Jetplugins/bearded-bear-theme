package dev.jetplugins.beardedtheme;

import com.intellij.openapi.options.Configurable;
import com.intellij.ui.components.JBCheckBox;
import com.intellij.ui.components.JBLabel;
import com.intellij.util.ui.FormBuilder;
import org.jetbrains.annotations.Nls;
import org.jetbrains.annotations.Nullable;

import javax.swing.*;
import java.awt.Font;

public final class BeardedThemeConfigurable implements Configurable {

    private JBCheckBox iconsCheckBox;

    @Nls(capitalization = Nls.Capitalization.Title)
    @Override
    public String getDisplayName() {
        return "Bearded Theme";
    }

    @Override
    public @Nullable JComponent createComponent() {
        JBLabel heading = new JBLabel("Bearded Theme preferences");
        heading.setFont(heading.getFont().deriveFont(Font.BOLD, heading.getFont().getSize2D() + 2.0f));

        JBLabel description = new JBLabel(
                "<html>Choose whether Bearded file icons follow you when you switch between " +
                        "Bearded Theme variants.</html>"
        );
        iconsCheckBox = new JBCheckBox("Enable Bearded file icons");
        iconsCheckBox.setToolTipText("Show the Bearded icon set for files and folders");

        JBLabel themeHint = new JBLabel(
                "<html>To change colors, open <b>Appearance</b> and choose any Bearded Theme " +
                        "from the Theme list.</html>"
        );
        return FormBuilder.createFormBuilder()
                .addComponent(heading)
                .addComponent(description)
                .addComponent(iconsCheckBox)
                .addComponent(themeHint)
                .addComponentFillVertically(new JPanel(), 0)
                .getPanel();
    }

    @Override
    public @Nullable JComponent getPreferredFocusedComponent() {
        return iconsCheckBox;
    }

    @Override
    public boolean isModified() {
        return iconsCheckBox.isSelected() != BeardedThemeSettings.getInstance().isIconsEnabled();
    }

    @Override
    public void apply() {
        BeardedThemeSettings.getInstance().setIconsEnabled(iconsCheckBox.isSelected());
    }

    @Override
    public void reset() {
        iconsCheckBox.setSelected(BeardedThemeSettings.getInstance().isIconsEnabled());
    }

    @Override
    public void disposeUIResources() {
        iconsCheckBox = null;
    }
}
