var chakram = require('chakram'),
    expect = chakram.expect;
	
var gitURL = "http://gitlab.karsa.org:8617/test/automationRepository.git";
var username = "testUser";
var password = "123456789";
var serverRootURL = "http://localhost:8090/api";
var repositoryRootURL = "/repositories";
var localRepoURL = "/localRepo";
var gitCommandsURL = "/git";

describe("Git repo clone and get", function () {
  
	it("clone the repo, the remote URL and localPath should be returned plus correct Http status", function () {
		var requestBody = {
			"remoteRepositoryUrl" : gitURL,
			"userName": username,
			"password": password
		}
		
		var response = chakram.post(serverRootURL + repositoryRootURL, requestBody);
		expect(response).to.have.status(201);
		expect(response).to.have.header("content-type", "application/json;charset=UTF-8");
		expect(response).to.comprise.of.json({
			"localPath": "gitRepos/automationRepository",
			"remoteUrl": gitURL
		});
		return chakram.wait();
	});
  
	it("get the cloned the repo, correct data plus correct Http status", function () {
		var requestBody = {
			"remoteRepositoryUrl" : gitURL,
			"userName": username,
			"password": password
		}

		chakram.post(serverRootURL + repositoryRootURL, requestBody);
		var response = chakram.get(serverRootURL + repositoryRootURL);
		expect(response).to.have.status(200);
		expect(response).to.have.header("content-type", "application/json;charset=UTF-8");
		expect(response).to.comprise.of.json({
			"localPath": "gitRepos/automationRepository",
			"remoteUrl": gitURL
		});
		return chakram.wait();
	});
});

describe("Get files/scenarios in the test repository", function () {
	var fileName = "/hello";
	var scenarioTitle = "I am the second niceer";
	
	function getRepo() {
        var requestBody = {
			"remoteRepositoryUrl" : gitURL,
			"userName": username,
			"password": password
		}
		
		return chakram.post(serverRootURL + repositoryRootURL, requestBody);
	}
  
	it("get the files of the repository", function () {
		return getRepo().then(function(openResponse) {
			var response = chakram.get(serverRootURL + localRepoURL);
			expect(response).to.have.status(200);
			expect(response).to.have.header("content-type", "application/json;charset=UTF-8");
			expect(response).to.have.schema("_embedded.featureFiles", {
				type: "array",
				items: {
					type: "object",
					properties: {
						title: {type: "string"},
						fileName: {type: "string"},
						description: {type: "array"},
						scenarios: {
							type: "array",
							items: {
								type: "object",
								properties: {
									title: {type: "string"},
									content: {type: "array"}
								}
							}
						}
					}
				}
			});
			return chakram.wait();
		});
	});
	
	it("get the content of a file", function () {
		return getRepo().then(function(openResponse) {
			var response = chakram.get(serverRootURL + localRepoURL + "/" + fileName);
			expect(response).to.have.status(200);
			expect(response).to.have.header("content-type", "application/json;charset=UTF-8");
			expect(response).to.have.schema({
				type: "object",
				properties: {
					title: {type: "string"},
					fileName: {type: "string"},
					description: {type: "array"},
					scenarios: {
						type: "array",
						items: {
							type: "object",
							properties: {
								title: {type: "string"},
								content: {type: "array"}
							}
						}
					}
				}
			});
			return chakram.wait();
		});
	});
	
	it("get the scenarios of a file", function () {
		return getRepo().then(function(openResponse) {
			var response = chakram.get(serverRootURL + localRepoURL + "/" + fileName + "/scenarios");
			expect(response).to.have.status(200);
			expect(response).to.have.header("content-type", "application/json;charset=UTF-8");
			expect(response).to.have.schema("_embedded.scenarios", {
				type: "array",
				items: {
					type: "object",
					properties:  {
						title: {type: "string"},
						content: {type: "array"}
					}
				}
			});
			return chakram.wait();
		});
	});
	
	it("search for matching scenarios", function () {
		return getRepo().then(function(openResponse) {
			var response = chakram.get(serverRootURL + localRepoURL + "/searchScenario?scenarioTitle=" + scenarioTitle);
			expect(response).to.have.status(200);
			expect(response).to.have.header("content-type", "application/json;charset=UTF-8");
			expect(response).to.have.schema("_embedded.extendedScenarios", {
				type: "array",
				items: {
					type: "object",
					properties:  {
						scenario: {type: "object"},
						fileName: {type: "string"}
					}
				}
			});
			return chakram.wait();
		});
	});
	
	it("update the text of a file's scenario", function () {
		return getRepo().then(function(openResponse) {
			var newScenario = {
				"title": "Scenario Outline: I am the second niceer scenario",
				"content": [
					"\tGivan that I am not looking for anything",
					"\tWhen I want to do somthing",
					"\tThen I get a point for \"<thing>\""
			      ]
			};
			
			var response = chakram.post(serverRootURL + localRepoURL + fileName + "/scenarios/search?scenarioTitle=" + scenarioTitle, newScenario);
			expect(response).to.have.status(200);
			expect(response).to.have.header("content-type", "application/json;charset=UTF-8");
			return chakram.wait();
		});
	});
});

describe("Git commands", function () {
	var commitMessage = "commit from chakram";
  
	it("git add commit push", function () {
		var response = chakram.get(serverRootURL + gitCommandsURL + "/addCommitPush?commitMessage=" + commitMessage);
		expect(response).to.have.status(200);
		return chakram.wait();
	});
  
	it("git get the most recent commit", function () {
		var response = chakram.get(serverRootURL + gitCommandsURL + "/history?numberOfCommit=0");
		expect(response).to.have.status(200);
		return chakram.wait();
	});
});