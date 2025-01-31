/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />

import {
    login,
    hasToBeSkipped,
    preservecookies,
    deleteApplicationTableRows,
    deleteAllBusinessServices,
    getRandomApplicationData,
    getRandomAnalysisData,
    writeMavenSettingsFile,
    resetURL,
} from "../../../../../utils/utils";
import * as data from "../../../../../utils/data_utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { CredentialType, UserCredentials } from "../../../../types/constants";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";
import { Proxy } from "../../../../models/administration/proxy/proxy";
import { MavenConfiguration } from "../../../../models/administration/repositories/maven";
import { GeneralConfig } from "../../../../models/administration/general/generalConfig";
let source_credential;
let maven_credential;
const mavenConfiguration = new MavenConfiguration();

describe(["@tier1"], "Binary Analysis", () => {
    before("Login", function () {
        // Perform login
        login();
        deleteApplicationTableRows();

        //Disable all proxy settings
        Proxy.disableAllProxies();

        // Enable HTML anc CSV report downloading
        let generalConfig = GeneralConfig.getInstance();
        generalConfig.enableDownloadHtml();
        generalConfig.enableDownloadCsv();

        // Clears artifact repository
        mavenConfiguration.clearRepository();

        //Create source and maven credentials required for analysis
        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();
        maven_credential = new CredentialsMaven(
            data.getRandomCredentialsData(CredentialType.maven, "None", true)
        );
        maven_credential.create();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    afterEach("Persist session", function () {
        // Reset URL from report page to web UI
        resetURL();
    });

    after("Perform test data clean up", function () {
        deleteApplicationTableRows();
        deleteAllBusinessServices();
        source_credential.delete();
        maven_credential.delete();

        // Disable HTML anc CSV report downloading
        let generalConfig = GeneralConfig.getInstance();
        generalConfig.disableDownloadHtml();
        generalConfig.disableDownloadCsv();

        writeMavenSettingsFile(data.getRandomWord(5), data.getRandomWord(5));
    });

    it("Binary Analysis", function () {
        // For binary analysis application must have group,artifcat and version.
        const application = new Analysis(
            getRandomApplicationData("tackletestApp_binary", {
                binaryData: this.appData["tackle-testapp-binary"],
            }),
            getRandomAnalysisData(this.analysisData["binary_analysis_on_tackletestapp"])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        // Both source and maven credentials required for binary.
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.downloadReport("HTML");
        application.downloadReport("CSV");
        application.openReport();
        application.validateStoryPoints();
    });
});
