const nodemailer = require("nodemailer");

exports.sendmail = async (req, res) => {
  // Definindo defaults
  const defaultTitle = "Nova mensagem vinda do site!";

  // Recebendo os dados da requisição
  const { title = "", data = "", to = "", cc = "" } = req.body.params;

  if (title === "" || data === "")
    return res.status(503).json({
      e: "Dados de requisição inválidos",
    });

  const hostname = process.env.MAIL_HOST;
  const hostport = process.env.MAIL_PORT;
  const hostuser = process.env.MAIL_USER;
  const hostpass = process.env.MAIL_PASS;

  let mailBody;

  // Condição de erro caso a requisição não seja compatível com a API
  if (typeof data !== "object")
    return res.status(400).json({
      data: "[1] As informações da requisição são inválidas",
    });

  mailBody =
    typeof title !== "undefined"
      ? "<h1>" + title + "</h1>"
      : `<h1>${defaultTitle}</h1>`;
  data.forEach((el) => {
    if (typeof el.legend === "undefined" || typeof el.desc === "undefined")
      return res.status(400).json({
        data: "[2] As informações da requisição são inválidas",
      });

    mailBody += `<p><b>${el.legend}</b>: ${el.desc}</p>`;
  });

  let configuracoes = {
    from: `<${hostuser}>`,
    to: `<${!to.length ? hostuser : to}>`,
    subject: typeof title !== "undefined" ? title : defaultTitle,
    html: mailBody,
    cc,
  };

  let transportador = nodemailer.createTransport({
    direct: true,
    host: hostname,
    port: hostport,
    secure: false, // use SSL

    auth: {
      user: hostuser,
      pass: hostpass,
    },
    tls: {
      rejectUnauthorized: false,
      secureProtocol: "TLSv1_method",
    },
  });

  await transportador.sendMail(configuracoes, function (error, response) {
    return error ? res.send(error) : res.send("Email enviado com sucesso!");
  });
};
