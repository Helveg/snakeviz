import cProfile, pstats
import time

def cpu_intensive_task():
    # Do something heavy for ~1 second
    start = time.time()
    while time.time() - start < 1:
        sum(i*i for i in range(10_000))

if __name__ == "__main__":
    profiler = cProfile.Profile()
    profiler.enable()
    cpu_intensive_task()
    profiler.disable()
    profiler.dump_stats("profile.prof")

    # Optional: also print top 10 functions
    stats = pstats.Stats(profiler)
    stats.sort_stats("cumulative").print_stats(10)
