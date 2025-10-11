function status(request, response) {
  response.status(200).json({ message: "Serviço up - 200" });
}

export default status;
