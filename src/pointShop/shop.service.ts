import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { ShopItem, UserItem } from '@prisma/client';
import { CreateShopItemDto, UpdateShopItemDto } from './shop.dto';

@Injectable()
export class ShopService {
  constructor(private readonly prismaService: PrismaService) {}

  async createShopItem(shopItemData: CreateShopItemDto) {
    return this.prismaService.shopItem.create({
      data: {
        name: shopItemData.name,
        description: shopItemData.description,
        price: parseInt(shopItemData.price.toString()),
        type: shopItemData.type,
        imageUrl: shopItemData.imageUrl || '',
        discount: shopItemData.discount || 0,
      },
    });
  }

  async updateShopItem(
    id: string,
    shopItemData: UpdateShopItemDto,
    userId: string,
  ) {
    const shopItem = await this.prismaService.shopItem.findUnique({
      where: { id },
    });

    if (!shopItem) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Shop item không tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.prismaService.shopItem.update({
      where: { id },
      data: {
        ...shopItemData,
        // updatedBy: userId,
      },
    });
  }

  async getShopItems() {
    return this.prismaService.shopItem.findMany();
  }

  async getShopItemById(id: string) {
    const shopItem = await this.prismaService.shopItem.findUnique({
      where: { id },
    });

    if (!shopItem) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Shop item không tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return shopItem;
  }

  async deleteShopItem(id: string, userId: string) {
    const shopItem = await this.prismaService.shopItem.findUnique({
      where: { id },
    });

    if (!shopItem) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Shop item không tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Optional: Add permission check if needed
    // if (shopItem.createdBy !== userId) {
    //   throw new HttpException(
    //     {
    //       statusCode: HttpStatus.FORBIDDEN,
    //       message: 'Bạn không có quyền xóa shop item này',
    //     },
    //     HttpStatus.FORBIDDEN,
    //   );
    // }

    await this.prismaService.shopItem.delete({
      where: { id },
    });
  }

  // async getShopItemsByType(type: string) {
  //   return this.prismaService.shopItem.findMany({
  //     where: { type },
  //   });
  // }

  async getShopItemsWithDiscount() {
    return this.prismaService.shopItem.findMany({
      where: {
        discount: {
          gt: 0,
        },
      },
    });
  }

  async userBuyItenm(userId: string, itemId: string) {
    const item = await this.prismaService.shopItem.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Shop item không tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User không tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (user.point < item.price) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'User không đủ điểm để mua shop item này',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        point: {
          decrement: item.price,
        },
      },
    });

    return this.prismaService.userItem.create({
      data: {
        userId: userId,
        itemId: itemId,
      },
    });
  }

  async getUserItems(userId: string) {
    return this.prismaService.userItem.findMany({
      where: { userId },
      include: {
        item: true,
      },
    });
  }
}
