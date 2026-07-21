from flask import Flask, render_template_string

app = Flask(__name__)
app.debug = True

html_content = '''
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>𝐀𝐊𝐀𝐓𝐒𝐔𝐊𝐈 🖤</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css"/>
  <style>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  font-family:'Poppins',sans-serif;
  color:#fff;
  padding:20px;
  overflow-x:hidden;
  background:linear-gradient(
      135deg,
      #050816,
      #0f172a,
      #111827
  );
}

/* Animated Neon Background */
body::before{
  content:"";
  position:fixed;
  inset:0;
  background:
  radial-gradient(circle at 20% 20%,rgba(0,255,255,.20),transparent 35%),
  radial-gradient(circle at 80% 70%,rgba(0,132,255,.25),transparent 35%);
  animation:moveBg 8s infinite alternate;
  z-index:-1;
}

@keyframes moveBg{
  from{transform:scale(1);}
  to{transform:scale(1.15);}
}

h1,h2,h3,h4{
  text-align:center;
  color:#00e5ff;
  text-shadow:0 0 20px #00e5ff;
}

/* Glass Card */
.image-container{
  width:330px;
  height:200px;
  margin:20px auto;
  overflow:hidden;
  border-radius:20px;
  backdrop-filter:blur(12px);
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.15);
  box-shadow:
  0 0 20px rgba(0,229,255,.4),
  0 0 40px rgba(0,229,255,.2);
}

.image{
  width:100%;
  height:100%;
  object-fit:cover;
}

/* Neon Buttons */
.button-34{
  display:block;
  margin:15px auto;
  padding:12px 28px;
  border:none;
  border-radius:40px;
  font-weight:700;
  cursor:pointer;
  color:white;
  background:linear-gradient(
      90deg,
      #00e5ff,
      #0077ff
  );
  box-shadow:
  0 0 15px #00e5ff,
  0 0 35px rgba(0,229,255,.4);
  transition:.3s;
}

.button-34:hover{
  transform:translateY(-4px) scale(1.05);
  box-shadow:
  0 0 25px #00e5ff,
  0 0 50px rgba(0,229,255,.6);
}

.footer{
  text-align:center;
  margin-top:40px;
  color:#d1d5db;
}

.footer a{
  color:#00e5ff;
  text-decoration:none;
}

.footer i{
  font-size:22px;
  margin:0 10px;
}

.footer i:hover{
  color:#00e5ff;
  text-shadow:0 0 15px #00e5ff;
}
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
<h2>𝐀𝐊𝐀𝐓𝐒𝐔𝐊𝐈 𝐖𝟑𝐁 𝐏𝟗𝐍𝐍𝟑𝐋 🖤</h2>

  <div class="image-container">
    <img src="https://i.ibb.co/qY0sFcMP/Chat-GPT-Image-Jul-3-2026-09-30-59-AM.png" class="image">
  </div>
  <h3>C0NT9CT 0WN3R - AKATSUKI 0WN3R F3LIIX URF PRINC3 🖤</h3>
  <button class="button-34" onclick="window.location.href='https://wa.me/+918390852779'">C0NT9NCT 9DMIN</button>

  <div class="image-container">
    <img src="https://i.ibb.co/FkgWB9T2/4f1ba069-c610-4ae2-9285-3fdd0a118c81.png" class="image">
  </div>
  <button class="button-34" onclick="window.location.href='http://78.154.103.12:15822/'">0FFLIN3 C0NV0 S3RV3R</button>

  <div class="image-container">
    <img src="https://i.ibb.co/dwT7bMMj/c4088da3-5474-44bb-8b00-823b41a0d1ad.png" class="image">
  </div>
  <button class="button-34" onclick="window.location.href='http://127.0.0.1:20582/'">T0K3N CH3CK3R + CR9CK3R</button>

  <div class="image-container">
    <img src="https://i.ibb.co/RTv2THN4/Chat-GPT-Image-Jul-4-2026-05-45-47-PM.png" class="image">
  </div>
  <button class="button-34" onclick="window.location.href='https://token-generation-7274.onrender.com/'">T0K3N G3N3R9T0R</button>


  <div class="footer">
    <p>
      <a href="/terms">Terms</a> |
      <a href="/privacy">Privacy</a>
    </p>
    <p>
      <a href="https://www.facebook.com/profile.php?id="><i class="fab fa-facebook"></i></a>
      <a href="https://wa.me/+918390852779"><i class="fab fa-whatsapp"></i></a>
      <a href="https://github.com//"><i class="fab fa-github"></i></a>
    </p>
    <p>© 2025 THE FELIIX URF PRINCE All RIGHTS RESERVED</p>
    <p>Created by feliix urf prince<a href="#"> Enjoy The Panel </a></p>
  </div>

</body>
</html>
'''

@app.route('/')
def home():
    return render_template_string(html_content)

if __name__ == '__main__':

    app.run(host='0.0.0.0', port=5000)
