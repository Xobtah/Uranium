#include <unistd.h>

int	main()
{
    int pid = 0;

    if (pid = fork())
    {
        waitpid(pid);
        execlp("electron-packager", "electron-packager", ".");
    }
    else
        execlp("npm", "npm", "i");
    return (0);
}
