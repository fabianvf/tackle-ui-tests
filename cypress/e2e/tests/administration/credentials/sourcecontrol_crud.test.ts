import { hasToBeSkipped, login, preservecookies } from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { CredentialsSourceControlKey } from "../../../models/administration/credentials/credentialsSourceControlKey";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType, UserCredentials } from "../../../types/constants";

describe(["@tier1"], "Validation of Source Control Credentials", () => {
    let scCredsUsername;
    let scCredsKey;
    const toBeCanceled = true;

    before("Login", function () {
        // Perform login
        login();
        scCredsUsername = new CredentialsSourceControlUsername(
            getRandomCredentialsData(CredentialType.sourceControl, UserCredentials.usernamePassword)
        );
        scCredsKey = new CredentialsSourceControlKey(
            getRandomCredentialsData(CredentialType.sourceControl, UserCredentials.sourcePrivateKey)
        );
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it(
        "Creating source control credentials with username/password and cancelling without saving",
        { tags: ["@tier1", "@dc"] },
        () => {
            scCredsUsername.create(toBeCanceled);
        }
    );

    it("Creating source control credentials with username/password", () => {
        scCredsUsername.create();
    });

    it("Editing source control credentials with username/password and cancelling without saving", () => {
        scCredsUsername.edit(getRandomCredentialsData(CredentialType.sourceControl), toBeCanceled);
    });

    it("Editing source control credentials with username/password", () => {
        scCredsUsername.edit(getRandomCredentialsData(CredentialType.sourceControl));
    });

    it("Creating source control credentials with source private key and cancelling without saving", () => {
        scCredsKey.create(toBeCanceled);
    });

    it("Creating source control credentials with source private key", () => {
        scCredsKey.create();
    });

    it("Editing source control credentials with source private key and cancelling without saving", () => {
        scCredsKey.edit(
            getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.sourcePrivateKey
            ),
            toBeCanceled
        );
    });

    it("Editing source control credentials with source private key", () => {
        scCredsKey.edit(
            getRandomCredentialsData(CredentialType.sourceControl, UserCredentials.sourcePrivateKey)
        );
    });

    it("Deleting source control credentials with username/password with cancellation", () => {
        scCredsUsername.delete(toBeCanceled);
    });

    it("Deleting source control credentials with source private key with cancellation", () => {
        scCredsKey.delete(toBeCanceled);
    });

    after("Cleaning up", () => {
        scCredsUsername.delete();
        scCredsKey.delete();
    });
});
