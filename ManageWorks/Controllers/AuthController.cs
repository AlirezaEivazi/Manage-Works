using ManageWorks.DTO;
using ManageWorks.Services;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;


namespace ManageWorks.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly JwtService _jwtService;

        public AuthController(UserService userService, JwtService jwtService)
        {
            _userService = userService;
            _jwtService = jwtService;
        }


        [HttpPost("register")]
        public IActionResult Register(RegisterDto dto)
        {
            var success = _userService.Register(dto);
            if (!success)
                return BadRequest("نام کاربری تکراری است");

            return Ok("ثبت‌نام با موفقیت انجام شد");
        }
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var user = _userService.LoginUser(dto);
            if (user == null)
                return Unauthorized("Invalid username or password");


            var token = _jwtService.Generate(user);
            return Ok(new { token });
        }

    }
}