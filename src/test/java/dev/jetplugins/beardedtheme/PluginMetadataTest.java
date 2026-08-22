package dev.jetplugins.beardedtheme;

import org.junit.Test;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilderFactory;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;

/** Protects Marketplace metadata that must remain compatible across plugin releases. */
public class PluginMetadataTest {

    private static final Path PLUGIN_XML = Paths.get("src/main/resources/META-INF/plugin.xml");

    @Test
    public void paidFeaturesRemainOptionalForMarketplaceCompatibility() throws Exception {
        Element descriptor = (Element) DocumentBuilderFactory.newInstance()
            .newDocumentBuilder()
            .parse(PLUGIN_XML.toFile())
            .getElementsByTagName("product-descriptor")
            .item(0);

        assertThat(descriptor).as("product-descriptor is present").isNotNull();
        assertThat(descriptor.getAttribute("code")).isEqualTo("PBEARDEDTHEME");
        assertThat(descriptor.getAttribute("optional"))
            .as("Marketplace pricing model cannot change after the first release")
            .isEqualTo("true");
    }
}
