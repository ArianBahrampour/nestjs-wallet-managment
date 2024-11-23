import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  /**
   * Find a user by their API key.
   * @param apiKey - The user's API key.
   * @returns UserEntity if found, null otherwise.
   */
  async findByApiKey(apiKey: string): Promise<UserEntity | null> {
    return await this.findOne({ where: { apiKey } });
  }

  /**
   * Create and save a new user.
   * @param email - The user's email.
   * @param apiKey - The generated API key.
   * @returns The saved user entity.
   */
  async createUser(email: string, apiKey: string): Promise<UserEntity> {
    const user = this.create({ email, apiKey });
    return await this.save(user);
  }
}
