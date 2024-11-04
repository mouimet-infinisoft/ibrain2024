#!/bin/bash

# List all container IDs
containers=$(docker ps -a -q)

# Loop through each container ID
for container in $containers; do
    echo "Processing container: $container"

    # Stop the container if it is running
    if docker inspect -f '{{.State.Running}}' $container | grep -q true; then
        echo "Stopping container: $container"
        docker stop $container
    fi

    # Update the restart policy to 'no'
    echo "Updating restart policy for container: $container"
    docker update --restart no $container

    # Validate the change
    restart_policy=$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' $container)
    if [ "$restart_policy" == "no" ]; then
        echo "Restart policy successfully updated to 'no' for container: $container"
    else
        echo "Failed to update restart policy for container: $container"
    fi

    echo ""
done

echo "All containers processed."
