describe("Git repo clone and get", function () {
	
  it("if there is no cloned repo the API should return an error code and message", function () {
    var response = chakram.get("localhost:8090/api/repositories");
    expect(response).to.have.status(500);
    expect(response).to.have.header("content-type", "application/json");
    expect(response).to.comprise.of.json({
      error: "Internal Server Error",
	  message: "No active Git repo, please open one first."
    });
    return chakram.wait();
  });
}); 